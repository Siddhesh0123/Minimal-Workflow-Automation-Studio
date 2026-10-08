// API base URL and constants

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const NODE_CATEGORIES = {
  trigger: {
    label: 'Triggers',
    color: 'var(--color-node-trigger)',
    softColor: 'var(--color-node-trigger-soft)',
  },
  action: {
    label: 'Actions',
    color: 'var(--color-node-action)',
    softColor: 'var(--color-node-action-soft)',
  },
  logic: {
    label: 'Logic',
    color: 'var(--color-node-logic)',
    softColor: 'var(--color-node-logic-soft)',
  },
} as const;

export const NODE_TYPE_CONFIGS = {
  // Triggers
  schedule: { label: 'Schedule', category: 'trigger' as const, icon: 'Clock', description: 'Run on a cron schedule' },
  webhook: { label: 'Webhook', category: 'trigger' as const, icon: 'Webhook', description: 'Triggered by HTTP request' },
  manual: { label: 'Manual', category: 'trigger' as const, icon: 'Play', description: 'Trigger manually' },
  // Actions
  http_request: { label: 'HTTP Request', category: 'action' as const, icon: 'Globe', description: 'Make an HTTP request' },
  send_email: { label: 'Send Email', category: 'action' as const, icon: 'Mail', description: 'Send an email' },
  transform_data: { label: 'Transform', category: 'action' as const, icon: 'Wand2', description: 'Transform data with JS' },
  write_file: { label: 'Write File', category: 'action' as const, icon: 'FileOutput', description: 'Write to CSV or JSON' },
  // Logic
  condition: { label: 'Condition', category: 'logic' as const, icon: 'GitBranch', description: 'Branch on condition' },
  delay: { label: 'Delay', category: 'logic' as const, icon: 'Timer', description: 'Wait for a duration' },
} as const;

export const DEFAULT_CONFIGS = {
  schedule: { cronExpression: '0 9 * * *' },
  webhook: { path: '/webhook', method: 'POST' as const },
  manual: { inputData: '{}' },
  http_request: { url: '', method: 'GET' as const, headers: {}, body: '', contentType: 'application/json' },
  send_email: { to: '', subject: '', body: '', isHtml: false },
  transform_data: { expression: 'return data;', description: '' },
  write_file: { filename: 'output', format: 'json' as const, append: false },
  condition: { expression: 'data.value > 0', description: '' },
  delay: { seconds: 5 },
} as const;
