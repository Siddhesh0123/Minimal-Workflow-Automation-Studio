// Main React Flow canvas component

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../../stores/workflowStore';
import { TriggerNode, ActionNode, LogicNode } from '../nodes/BaseNode';
import { AnimatedEdge } from '../edges/AnimatedEdge';
import { createFlowNode } from '../nodes/nodeTypes';
import type { FlowNodeType } from '../../types/node';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  logicNode: LogicNode,
};

const edgeTypes = {
  animatedEdge: AnimatedEdge,
};

const defaultEdgeOptions = {
  type: 'animatedEdge',
  animated: true,
};

export const FlowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useWorkflowStore();

  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/flowline-node') as FlowNodeType;
      if (!nodeType || !reactFlowInstance.current || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode = createFlowNode(nodeType, position);
      addNode(newNode);
    },
    [addNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        style={{ backgroundColor: 'var(--color-bg-canvas)' }}
      >
        <Controls
          showInteractive={false}
          position="bottom-left"
        />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            const data = node.data as { category?: string };
            switch (data?.category) {
              case 'trigger':
                return 'var(--color-node-trigger)';
              case 'action':
                return 'var(--color-node-action)';
              case 'logic':
                return 'var(--color-node-logic)';
              default:
                return 'var(--color-border)';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--color-border)"
        />
      </ReactFlow>
    </div>
  );
};
