// Run and log type definitions

import type { NodeStatus } from './node';

export type RunStatus = 'pending' | 'running' | 'success' | 'failed';

export interface NodeLog {
  id: string;
  runId: string;
  nodeId: string;
  nodeType: string;
  status: NodeStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt: string;
  finishedAt?: string;
  duration?: number; // ms
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number; // ms
  logs: NodeLog[];
}
