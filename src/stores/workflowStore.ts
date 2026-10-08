// Workflow state store - nodes, edges, selected node, CRUD

import { create } from 'zustand';
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { FlowNodeData, NodeStatus } from '../types/node';
import type { Workflow } from '../types/workflow';

interface WorkflowState {
  // Current workflow
  currentWorkflow: Workflow | null;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;

  // Workflow list
  workflows: Workflow[];
  loading: boolean;

  // Actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange<Node<FlowNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<FlowNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  updateNodeConfig: (nodeId: string, config: FlowNodeData['config']) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  resetNodeStatuses: () => void;
  setWorkflows: (workflows: Workflow[]) => void;
  setLoading: (loading: boolean) => void;
  setDirty: (dirty: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>()((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  workflows: [],
  loading: false,

  setCurrentWorkflow: (workflow) => {
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes ?? [],
      edges: workflow?.edges ?? [],
      selectedNodeId: null,
      isDirty: false,
    });
  },

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, type: 'animatedEdge', animated: true },
        get().edges
      ),
      isDirty: true,
    });
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node], isDirty: true });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } as FlowNodeData } : n
      ),
      isDirty: true,
    });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config } as FlowNodeData }
          : n
      ),
      isDirty: true,
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDirty: true,
    });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setNodeStatus: (nodeId, status) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status } as FlowNodeData } : n
      ),
    });
  },

  resetNodeStatuses: () => {
    set({
      nodes: get().nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle' as const } as FlowNodeData,
      })),
    });
  },

  setWorkflows: (workflows) => set({ workflows }),
  setLoading: (loading) => set({ loading }),
  setDirty: (dirty) => set({ isDirty: dirty }),
}));
