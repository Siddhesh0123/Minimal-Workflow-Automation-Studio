import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { engine } from '../engine/executor';

const router = Router();

// Zod schemas for validation
const NodeSchema = z.any(); // In a real app, define rigorous schemas
const EdgeSchema = z.any();

const CreateWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
});

const UpdateWorkflowSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  nodes: z.array(NodeSchema).optional(),
  edges: z.array(EdgeSchema).optional(),
});

// GET all workflows
router.get('/', async (req, res, next) => {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    
    // Parse JSON strings back to objects for frontend
    const parsedWorkflows = workflows.map((w) => ({
      ...w,
      nodes: JSON.parse(w.nodes),
      edges: JSON.parse(w.edges),
    }));
    
    res.json(parsedWorkflows);
  } catch (err) {
    next(err);
  }
});

// GET single workflow
router.get('/:id', async (req, res, next) => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
    });
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges),
    });
  } catch (err) {
    next(err);
  }
});

// POST create workflow
router.post('/', async (req, res, next) => {
  try {
    const data = CreateWorkflowSchema.parse(req.body);
    
    const workflow = await prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        nodes: JSON.stringify(data.nodes),
        edges: JSON.stringify(data.edges),
      },
    });
    
    res.status(201).json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges),
    });
  } catch (err) {
    next(err);
  }
});

// PUT update workflow
router.put('/:id', async (req, res, next) => {
  try {
    const data = UpdateWorkflowSchema.parse(req.body);
    
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.nodes !== undefined) updateData.nodes = JSON.stringify(data.nodes);
    if (data.edges !== undefined) updateData.edges = JSON.stringify(data.edges);
    
    const workflow = await prisma.workflow.update({
      where: { id: req.params.id },
      data: updateData,
    });
    
    res.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE workflow
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.workflow.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST run workflow
router.post('/:id/run', async (req, res, next) => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
    });
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Trigger execution asynchronously
    engine.executeWorkflow(
      workflow.id, 
      JSON.parse(workflow.nodes), 
      JSON.parse(workflow.edges)
    ).catch(err => console.error("Execution error:", err));
    
    res.status(202).json({ message: 'Execution started' });
  } catch (err) {
    next(err);
  }
});

export default router;
