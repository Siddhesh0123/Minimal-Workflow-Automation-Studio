// Node type definitions and factory for React Flow

import type { Node } from '@xyflow/react';
import type {
  FlowNodeData,
  NodeCategory,
  FlowNodeType,
} from '../../types/node';
import { NODE_TYPE_CONFIGS, DEFAULT_CONFIGS } from '../../lib/constants';

export const nodeTypeMap = {
  triggerNode: 'triggerNode',
  actionNode: 'actionNode',
  logicNode: 'logicNode',
} as const;

export function getCategoryForType(nodeType: FlowNodeType): NodeCategory {
  const config = NODE_TYPE_CONFIGS[nodeType];
  return config.category;
}

export function getReactFlowNodeType(category: NodeCategory): string {
  switch (category) {
    case 'trigger':
      return nodeTypeMap.triggerNode;
    case 'action':
      return nodeTypeMap.actionNode;
    case 'logic':
      return nodeTypeMap.logicNode;
  }
}

let nodeCounter = 0;

export function createFlowNode(
  nodeType: FlowNodeType,
  position: { x: number; y: number }
): Node<FlowNodeData> {
  const category = getCategoryForType(nodeType);
  const config = NODE_TYPE_CONFIGS[nodeType];
  const defaultConfig = { ...DEFAULT_CONFIGS[nodeType] };
  nodeCounter += 1;

  return {
    id: `node_${Date.now()}_${nodeCounter}`,
    type: getReactFlowNodeType(category),
    position,
    data: {
      label: config.label,
      category,
      nodeType,
      config: defaultConfig,
      status: 'idle',
      description: config.description,
    },
  };
}
