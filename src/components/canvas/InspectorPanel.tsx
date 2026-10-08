// Inspector panel for configuring the selected node

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { Input, Textarea, Select } from '../ui/Input';

import type {
  FlowNodeData,
  ScheduleConfig,
  WebhookConfig,
  ManualConfig,
  HttpRequestConfig,
  SendEmailConfig,
  TransformDataConfig,
  WriteFileConfig,
  ConditionConfig,
  DelayConfig,
} from '../../types/node';

export const InspectorPanel: React.FC = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, updateNodeConfig, removeNode } =
    useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const data = selectedNode?.data as FlowNodeData | undefined;

  return (
    <AnimatePresence>
      {selectedNode && data && (
        <motion.div
          initial={{ opacity: 0, x: 16, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 320 }}
          exit={{ opacity: 0, x: 16, width: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full border-l overflow-y-auto flex-shrink-0"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h3
              className="text-[13px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Node Settings
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  removeNode(selectedNodeId!);
                  setSelectedNodeId(null);
                }}
                className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer border-none transition-colors duration-150"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-tertiary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-error-soft)';
                  e.currentTarget.style.color = 'var(--color-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
                title="Delete node"
                aria-label="Delete node"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer border-none transition-colors duration-150"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-tertiary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
                title="Close panel"
                aria-label="Close panel"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            className="p-4 flex flex-col gap-4"
          >
            {/* Label */}
            <Input
              label="Label"
              value={data.label}
              onChange={(e) =>
                updateNodeData(selectedNodeId!, { label: e.target.value })
              }
              placeholder="Node name"
            />

            {/* Description */}
            <Input
              label="Description"
              value={data.description || ''}
              onChange={(e) =>
                updateNodeData(selectedNodeId!, { description: e.target.value })
              }
              placeholder="Optional description"
            />

            {/* Divider */}
            <div
              className="h-px -mx-4"
              style={{ backgroundColor: 'var(--color-border)' }}
            />

            {/* Type-specific config */}
            <div>
              <h4
                className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Configuration
              </h4>
              <div className="flex flex-col gap-3">
                <NodeConfigForm
                  nodeType={data.nodeType}
                  config={data.config}
                  onChange={(config) =>
                    updateNodeConfig(selectedNodeId!, config)
                  }
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Type-specific configuration forms
interface NodeConfigFormProps {
  nodeType: string;
  config: FlowNodeData['config'];
  onChange: (config: FlowNodeData['config']) => void;
}

const NodeConfigForm: React.FC<NodeConfigFormProps> = ({
  nodeType,
  config,
  onChange,
}) => {
  switch (nodeType) {
    case 'schedule': {
      const c = config as ScheduleConfig;
      return (
        <>
          <Input
            label="Cron Expression"
            value={c.cronExpression || ''}
            onChange={(e) =>
              onChange({ ...c, cronExpression: e.target.value })
            }
            placeholder="0 9 * * *"
            helpText="e.g., '0 9 * * *' for 9 AM daily"
          />
          <Input
            label="Timezone"
            value={c.timezone || ''}
            onChange={(e) =>
              onChange({ ...c, timezone: e.target.value })
            }
            placeholder="UTC"
          />
        </>
      );
    }
    case 'webhook': {
      const c = config as WebhookConfig;
      return (
        <>
          <Input
            label="Webhook Path"
            value={c.path || ''}
            onChange={(e) => onChange({ ...c, path: e.target.value })}
            placeholder="/webhook/my-hook"
          />
          <Select
            label="Method"
            value={c.method || 'POST'}
            onChange={(e) =>
              onChange({ ...c, method: e.target.value as WebhookConfig['method'] })
            }
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' },
            ]}
          />
        </>
      );
    }
    case 'manual': {
      const c = config as ManualConfig;
      return (
        <Textarea
          label="Input Data (JSON)"
          value={c.inputData || '{}'}
          onChange={(e) =>
            onChange({ ...c, inputData: e.target.value })
          }
          placeholder='{"key": "value"}'
        />
      );
    }
    case 'http_request': {
      const c = config as HttpRequestConfig;
      return (
        <>
          <Input
            label="URL"
            value={c.url || ''}
            onChange={(e) => onChange({ ...c, url: e.target.value })}
            placeholder="https://api.example.com/data"
          />
          <Select
            label="Method"
            value={c.method || 'GET'}
            onChange={(e) =>
              onChange({ ...c, method: e.target.value as HttpRequestConfig['method'] })
            }
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'PATCH', label: 'PATCH' },
              { value: 'DELETE', label: 'DELETE' },
            ]}
          />
          <Textarea
            label="Headers (JSON)"
            value={
              typeof c.headers === 'object'
                ? JSON.stringify(c.headers, null, 2)
                : c.headers || ''
            }
            onChange={(e) => {
              try {
                onChange({ ...c, headers: JSON.parse(e.target.value) });
              } catch {
                // Keep as string until valid JSON
              }
            }}
            placeholder='{"Authorization": "Bearer ..."}'
          />
          {(c.method === 'POST' || c.method === 'PUT' || c.method === 'PATCH') && (
            <Textarea
              label="Body"
              value={c.body || ''}
              onChange={(e) => onChange({ ...c, body: e.target.value })}
              placeholder='{"key": "value"}'
            />
          )}
        </>
      );
    }
    case 'send_email': {
      const c = config as SendEmailConfig;
      return (
        <>
          <Input
            label="To"
            value={c.to || ''}
            onChange={(e) => onChange({ ...c, to: e.target.value })}
            placeholder="recipient@example.com"
          />
          <Input
            label="Subject"
            value={c.subject || ''}
            onChange={(e) =>
              onChange({ ...c, subject: e.target.value })
            }
            placeholder="Email subject"
          />
          <Textarea
            label="Body"
            value={c.body || ''}
            onChange={(e) => onChange({ ...c, body: e.target.value })}
            placeholder="Email content..."
          />
        </>
      );
    }
    case 'transform_data': {
      const c = config as TransformDataConfig;
      return (
        <>
          <Textarea
            label="Transform Expression"
            value={c.expression || ''}
            onChange={(e) =>
              onChange({ ...c, expression: e.target.value })
            }
            placeholder="return data.map(item => item.name);"
          />
          <Input
            label="Description"
            value={c.description || ''}
            onChange={(e) =>
              onChange({ ...c, description: e.target.value })
            }
            placeholder="What this transform does"
          />
        </>
      );
    }
    case 'write_file': {
      const c = config as WriteFileConfig;
      return (
        <>
          <Input
            label="Filename"
            value={c.filename || ''}
            onChange={(e) =>
              onChange({ ...c, filename: e.target.value })
            }
            placeholder="output"
          />
          <Select
            label="Format"
            value={c.format || 'json'}
            onChange={(e) =>
              onChange({ ...c, format: e.target.value as 'json' | 'csv' })
            }
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'csv', label: 'CSV' },
            ]}
          />
        </>
      );
    }
    case 'condition': {
      const c = config as ConditionConfig;
      return (
        <>
          <Textarea
            label="Condition Expression"
            value={c.expression || ''}
            onChange={(e) =>
              onChange({ ...c, expression: e.target.value })
            }
            placeholder="data.value > 0"
          />
          <Input
            label="Description"
            value={c.description || ''}
            onChange={(e) =>
              onChange({ ...c, description: e.target.value })
            }
            placeholder="What this condition checks"
          />
        </>
      );
    }
    case 'delay': {
      const c = config as DelayConfig;
      return (
        <Input
          label="Delay (seconds)"
          type="number"
          value={c.seconds || 5}
          onChange={(e) =>
            onChange({ ...c, seconds: parseInt(e.target.value) || 0 })
          }
          min={0}
          placeholder="5"
        />
      );
    }
    default:
      return (
        <p
          className="text-[12px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          No configuration available for this node type.
        </p>
      );
  }
};
