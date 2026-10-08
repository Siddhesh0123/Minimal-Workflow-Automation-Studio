import { EventEmitter } from 'events';
import { prisma } from '../index';
import { executeHttpRequest } from './nodes/httpRequest';
import { executeTransform } from './nodes/transform';
import { executeCondition } from './nodes/condition';

class WorkflowEngine {
  private emitter = new EventEmitter();
  
  subscribe(workflowId: string, callback: (data: any) => void) {
    this.emitter.on(`update:${workflowId}`, callback);
  }
  
  unsubscribe(workflowId: string, callback: (data: any) => void) {
    this.emitter.off(`update:${workflowId}`, callback);
  }
  
  private broadcast(workflowId: string, data: any) {
    this.emitter.emit(`update:${workflowId}`, data);
  }

  // Very basic DAG execution: finds start nodes, executes them, passes output to children
  async executeWorkflow(workflowId: string, nodes: any[], edges: any[]) {
    // 1. Create Run in DB
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: 'running',
      },
    });

    this.broadcast(workflowId, { type: 'run_start', runId: run.id });

    // 2. Build adjacency list and in-degree map
    const adj = new Map<string, { targetId: string, handle: string }[]>();
    const inDegree = new Map<string, number>();
    const nodeMap = new Map<string, any>(nodes.map(n => [n.id, n]));

    nodes.forEach(n => inDegree.set(n.id, 0));
    
    edges.forEach(e => {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source)!.push({ targetId: e.target, handle: e.sourceHandle || 'default' });
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    // 3. Find start nodes (in-degree 0)
    const queue = Array.from(inDegree.entries())
      .filter(([_, deg]) => deg === 0)
      .map(([id]) => id);
      
    // Output map to pass data between nodes
    const outputs = new Map<string, any>();
    
    let hasFailed = false;

    // Process nodes
    while (queue.length > 0 && !hasFailed) {
      const currentId = queue.shift()!;
      const node = nodeMap.get(currentId);
      
      if (!node) continue;
      
      this.broadcast(workflowId, { type: 'node_status', nodeId: currentId, status: 'running' });
      
      // Determine input for this node based on its predecessors
      // For simplicity, we'll merge inputs from all incoming edges
      let mergedInput: any = {};
      const incomingEdges = edges.filter(e => e.target === currentId);
      for (const edge of incomingEdges) {
         const sourceOutput = outputs.get(edge.source);
         if (sourceOutput) {
            // Handle conditional branches appropriately
            mergedInput = { ...mergedInput, ...sourceOutput };
         }
      }

      const startTime = Date.now();
      let nodeStatus = 'success';
      let nodeOutput: any = null;
      let nodeError: string | null = null;
      
      // Create log entry
      const log = await prisma.nodeLog.create({
        data: {
          runId: run.id,
          nodeId: currentId,
          nodeType: node.data.nodeType,
          status: 'running',
          input: JSON.stringify(mergedInput),
          startedAt: new Date(),
        }
      });

      try {
        // Execute based on node type
        nodeOutput = await this.executeNode(node, mergedInput);
        outputs.set(currentId, nodeOutput);
      } catch (err: any) {
        nodeStatus = 'failed';
        nodeError = err.message || 'Unknown error';
        hasFailed = true;
      }

      const duration = Date.now() - startTime;
      
      // Update log
      await prisma.nodeLog.update({
        where: { id: log.id },
        data: {
          status: nodeStatus,
          output: nodeOutput ? JSON.stringify(nodeOutput) : null,
          error: nodeError,
          finishedAt: new Date(),
          duration
        }
      });
      
      this.broadcast(workflowId, { type: 'node_status', nodeId: currentId, status: nodeStatus });
      
      // Enqueue children if successful
      if (nodeStatus === 'success') {
        const children = adj.get(currentId) || [];
        for (const child of children) {
          // If this was a condition node, only traverse the matching branch
          if (node.data.nodeType === 'condition') {
             if (child.handle === 'true' && nodeOutput === true) {
                // Pass
             } else if (child.handle === 'false' && nodeOutput === false) {
                // Pass
             } else {
                continue; // Skip this branch
             }
          }
          
          const targetId = child.targetId;
          inDegree.set(targetId, inDegree.get(targetId)! - 1);
          if (inDegree.get(targetId) === 0) {
            queue.push(targetId);
          }
        }
      }
    }

    // 4. Complete run
    const finalStatus = hasFailed ? 'failed' : 'success';
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: finalStatus,
        finishedAt: new Date(),
        duration: Date.now() - run.startedAt.getTime()
      }
    });

    this.broadcast(workflowId, { type: 'run_complete', runId: run.id, runStatus: finalStatus });
  }

  private async executeNode(node: any, input: any): Promise<any> {
    const config = node.data.config;
    
    switch (node.data.nodeType) {
      case 'http_request':
        return await executeHttpRequest(config, input);
      case 'transform_data':
        return await executeTransform(config, input);
      case 'condition':
        return await executeCondition(config, input);
      // Mock other nodes for now
      case 'schedule':
      case 'webhook':
      case 'manual':
        // Triggers just pass their config/input along
        let data = {};
        if (config.inputData) {
           try { data = JSON.parse(config.inputData); } catch {}
        }
        return { ...input, ...data };
      case 'delay':
        const ms = (config.seconds || 1) * 1000;
        await new Promise(r => setTimeout(r, ms));
        return input;
      case 'send_email':
        // Mock email
        console.log(`Sending email to ${config.to}: ${config.subject}`);
        return { emailSent: true };
      default:
        return input;
    }
  }
}

export const engine = new WorkflowEngine();
