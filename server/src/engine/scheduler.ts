import cron from 'node-cron';
import { prisma } from '../index';
import { engine } from './executor';

class Scheduler {
  private tasks = new Map<string, cron.ScheduledTask>();

  async initialize() {
    const jobs = await prisma.scheduledJob.findMany({
      where: { enabled: true }
    });
    
    for (const job of jobs) {
      this.scheduleJob(job.id, job.workflowId, job.cronExpr);
    }
  }

  scheduleJob(jobId: string, workflowId: string, cronExpr: string) {
    if (this.tasks.has(jobId)) {
      this.tasks.get(jobId)!.stop();
    }
    
    if (!cron.validate(cronExpr)) {
      console.error(`Invalid cron expression for job ${jobId}: ${cronExpr}`);
      return;
    }

    const task = cron.schedule(cronExpr, async () => {
      console.log(`Triggering scheduled workflow ${workflowId}`);
      
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId }
      });
      
      if (!workflow) return;
      
      try {
        await engine.executeWorkflow(
          workflow.id,
          JSON.parse(workflow.nodes),
          JSON.parse(workflow.edges)
        );
        
        await prisma.scheduledJob.update({
          where: { id: jobId },
          data: { lastRunAt: new Date() }
        });
      } catch (err) {
        console.error(`Error triggering scheduled workflow ${workflowId}:`, err);
      }
    });

    this.tasks.set(jobId, task);
  }

  unscheduleJob(jobId: string) {
    if (this.tasks.has(jobId)) {
      this.tasks.get(jobId)!.stop();
      this.tasks.delete(jobId);
    }
  }
}

export const scheduler = new Scheduler();
