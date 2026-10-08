// Base custom node component shared by all node types

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Clock,
  Webhook,
  Play,
  Globe,
  Mail,
  Wand2,
  FileOutput,
  GitBranch,
  Timer,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import type { FlowNodeData, FlowNodeType, NodeCategory } from '../../types/node';
import { useWorkflowStore } from '../../stores/workflowStore';

const iconMap: Record<FlowNodeType, React.FC<{ size?: number }>> = {
  schedule: Clock,
  webhook: Webhook,
  manual: Play,
  http_request: Globe,
  send_email: Mail,
  transform_data: Wand2,
  write_file: FileOutput,
  condition: GitBranch,
  delay: Timer,
};

const categoryStyles: Record<
  NodeCategory,
  { borderColor: string; iconBg: string; iconColor: string }
> = {
  trigger: {
    borderColor: 'var(--color-node-trigger)',
    iconBg: 'var(--color-node-trigger-soft)',
    iconColor: 'var(--color-node-trigger)',
  },
  action: {
    borderColor: 'var(--color-node-action)',
    iconBg: 'var(--color-node-action-soft)',
    iconColor: 'var(--color-node-action)',
  },
  logic: {
    borderColor: 'var(--color-node-logic)',
    iconBg: 'var(--color-node-logic-soft)',
    iconColor: 'var(--color-node-logic)',
  },
};

interface BaseNodeProps extends NodeProps {
  data: FlowNodeData;
}

const BaseNode: React.FC<BaseNodeProps> = ({ id, data, selected }) => {
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const Icon = iconMap[data.nodeType] || Play;
  const styles = categoryStyles[data.category];
  const isCondition = data.nodeType === 'condition';

  const statusClass =
    data.status === 'running'
      ? 'node-running'
      : data.status === 'success'
      ? 'node-success'
      : data.status === 'failed'
      ? 'node-error'
      : '';

  const statusBorderColor =
    data.status === 'running'
      ? 'var(--color-accent)'
      : data.status === 'success'
      ? 'var(--color-success)'
      : data.status === 'failed'
      ? 'var(--color-error)'
      : selected
      ? styles.borderColor
      : 'var(--color-border)';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      className={`relative ${statusClass}`}
      onClick={() => setSelectedNodeId(id)}
      style={{
        minWidth: 200,
        maxWidth: 240,
      }}
    >
      {/* Source handle - not on triggers */}
      {data.category !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: 8,
            height: 8,
            background: styles.borderColor,
            border: '2px solid var(--color-bg-secondary)',
            top: -4,
          }}
        />
      )}

      <div
        className="rounded-[var(--radius-lg)] cursor-pointer transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: `1.5px solid ${statusBorderColor}`,
          boxShadow: selected
            ? `0 0 0 3px ${styles.borderColor}20, var(--shadow-md)`
            : 'var(--shadow-sm)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: styles.iconBg,
              color: styles.iconColor,
            }}
          >
            <Icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] font-semibold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {data.label}
            </div>
            <div
              className="text-[11px] truncate"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {data.description || data.nodeType}
            </div>
          </div>

          {/* Status indicator */}
          {data.status !== 'idle' && (
            <div className="flex-shrink-0">
              {data.status === 'running' && (
                <Loader2
                  size={14}
                  className="animate-spin"
                  style={{ color: 'var(--color-accent)' }}
                />
              )}
              {data.status === 'success' && (
                <CheckCircle2
                  size={14}
                  style={{ color: 'var(--color-success)' }}
                />
              )}
              {data.status === 'failed' && (
                <XCircle
                  size={14}
                  style={{ color: 'var(--color-error)' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Category badge */}
        <div
          className="px-3 pb-2"
        >
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide"
            style={{
              backgroundColor: styles.iconBg,
              color: styles.iconColor,
            }}
          >
            {data.category}
          </span>
        </div>
      </div>

      {/* Target handle(s) */}
      {isCondition ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{
              width: 8,
              height: 8,
              background: 'var(--color-success)',
              border: '2px solid var(--color-bg-secondary)',
              bottom: -4,
              left: '30%',
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{
              width: 8,
              height: 8,
              background: 'var(--color-error)',
              border: '2px solid var(--color-bg-secondary)',
              bottom: -4,
              left: '70%',
            }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            width: 8,
            height: 8,
            background: styles.borderColor,
            border: '2px solid var(--color-bg-secondary)',
            bottom: -4,
          }}
        />
      )}
    </motion.div>
  );
};

export const TriggerNode = memo((props: NodeProps) => (
  <BaseNode {...props} data={props.data as FlowNodeData} />
));
TriggerNode.displayName = 'TriggerNode';

export const ActionNode = memo((props: NodeProps) => (
  <BaseNode {...props} data={props.data as FlowNodeData} />
));
ActionNode.displayName = 'ActionNode';

export const LogicNode = memo((props: NodeProps) => (
  <BaseNode {...props} data={props.data as FlowNodeData} />
));
LogicNode.displayName = 'LogicNode';
