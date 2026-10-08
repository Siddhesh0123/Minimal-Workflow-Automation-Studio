import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { engine } from '../engine/executor';

const router = Router();

// GET all runs for a workflow
router.get('/workflow/:workflowId', async (req: Request, res: Response, next) => {
  try {
    const runs = await prisma.workflowRun.findMany({
      where: { workflowId: req.params.workflowId },
      orderBy: { startedAt: 'desc' },
      include: { logs: true },
    });
    res.json(runs);
  } catch (err) {
    next(err);
  }
});

// GET single run with logs
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const run = await prisma.workflowRun.findUnique({
      where: { id: req.params.id },
      include: {
        logs: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });
    
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }
    
    // Parse JSON fields in logs
    const parsedRun = {
      ...run,
      logs: run.logs.map((log) => ({
        ...log,
        input: log.input ? JSON.parse(log.input) : null,
        output: log.output ? JSON.parse(log.output) : null,
      })),
    };
    
    res.json(parsedRun);
  } catch (err) {
    next(err);
  }
});

// SSE endpoint for streaming live run status
router.get('/:workflowId/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connected message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const workflowId = req.params.workflowId;
  
  // Register client to receive updates from the executor engine
  const handleUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  engine.subscribe(workflowId, handleUpdate);

  // Cleanup on client disconnect
  req.on('close', () => {
    engine.unsubscribe(workflowId, handleUpdate);
    res.end();
  });
});

export default router;
