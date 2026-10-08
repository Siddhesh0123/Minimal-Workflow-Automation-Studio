// Workflow type definitions

import type { Node, Edge } from '@xyflow/react';
import type { FlowNodeData } from './node';

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
}
