// Workflow node and edge types for Flowline

export type NodeCategory = 'trigger' | 'action' | 'logic';

export type TriggerType = 'schedule' | 'webhook' | 'manual';
export type ActionType = 'http_request' | 'send_email' | 'transform_data' | 'write_file';
export type LogicType = 'condition' | 'delay';
export type FlowNodeType = TriggerType | ActionType | LogicType;

export interface ScheduleConfig {
  cronExpression: string;
  timezone?: string;
}

export interface WebhookConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface ManualConfig {
  inputData?: string; // JSON string
}

export interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  contentType?: string;
}

export interface SendEmailConfig {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface TransformDataConfig {
  expression: string; // JS expression applied to input data
  description?: string;
}

export interface WriteFileConfig {
  filename: string;
  format: 'json' | 'csv';
  append?: boolean;
}

export interface ConditionConfig {
  expression: string; // JS expression that returns boolean
  description?: string;
}

export interface DelayConfig {
  seconds: number;
}

export type NodeConfig =
  | ScheduleConfig
  | WebhookConfig
  | ManualConfig
  | HttpRequestConfig
  | SendEmailConfig
  | TransformDataConfig
  | WriteFileConfig
  | ConditionConfig
  | DelayConfig;

export type NodeStatus = 'idle' | 'running' | 'success' | 'failed';

export interface FlowNodeData {
  label: string;
  category: NodeCategory;
  nodeType: FlowNodeType;
  config: NodeConfig;
  status: NodeStatus;
  description?: string;
}
