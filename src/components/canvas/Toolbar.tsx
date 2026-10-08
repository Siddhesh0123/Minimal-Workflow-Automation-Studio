// Toolbar for the canvas page

import React, { useRef } from 'react';
import {
  Play,
  Save,
  Download,
  Upload,
  PanelLeft,
  Command,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useUIStore } from '../../stores/uiStore';
import { api } from '../../lib/api';
import type { Workflow } from '../../types/workflow';

export const Toolbar: React.FC = () => {
  const {
    currentWorkflow,
    nodes,
    edges,
    isDirty,
    setCurrentWorkflow,
    setDirty,
    resetNodeStatuses,
    setNodeStatus,
  } = useWorkflowStore();
  const { nodePaletteOpen, setNodePaletteOpen, setCommandPaletteOpen } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [running, setRunning] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (currentWorkflow?.id) {
        const updated = await api.put<Workflow>(
          `/workflows/${currentWorkflow.id}`,
          {
            name: nameRef.current?.value || currentWorkflow.name,
            nodes,
            edges,
          }
        );
        setCurrentWorkflow(updated);
        toast.success('Workflow saved');
      } else {
        const created = await api.post<Workflow>('/workflows', {
          name: nameRef.current?.value || currentWorkflow?.name || 'Untitled Workflow',
          nodes,
          edges,
        });
        setCurrentWorkflow(created);
        toast.success('Workflow created');
      }
      setDirty(false);
    } catch {
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!currentWorkflow?.id) {
      toast.error('Save the workflow first');
      return;
    }
    if (nodes.length === 0) {
      toast.error('Add some nodes first');
      return;
    }

    setRunning(true);
    resetNodeStatuses();

    try {
      // First save current state
      await api.put(`/workflows/${currentWorkflow.id}`, { nodes, edges });

      // Start run with SSE
      const cleanup = api.stream(
        `/runs/${currentWorkflow.id}/stream`,
        (data: unknown) => {
          const event = data as {
            type: string;
            nodeId?: string;
            status?: string;
            runStatus?: string;
          };

          if (event.type === 'node_status' && event.nodeId && event.status) {
            setNodeStatus(event.nodeId, event.status as 'idle' | 'running' | 'success' | 'failed');
          }

          if (event.type === 'run_complete') {
            setRunning(false);
            if (event.runStatus === 'success') {
              toast.success('Workflow completed successfully');
            } else {
              toast.error('Workflow failed');
            }
            cleanup();
          }
        }
      );

      // Trigger run
      await api.post(`/workflows/${currentWorkflow.id}/run`);
    } catch {
      setRunning(false);
      toast.error('Failed to run workflow');
    }
  };

  const handleExport = async () => {
    const workflowData = {
      name: nameRef.current?.value || currentWorkflow?.name || 'Untitled Workflow',
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowData.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes && data.edges) {
          useWorkflowStore.getState().setNodes(data.nodes);
          useWorkflowStore.getState().setEdges(data.edges);
          if (nameRef.current && data.name) {
            nameRef.current.value = data.name;
          }
          toast.success('Workflow imported');
        } else {
          toast.error('Invalid workflow file');
        }
      } catch {
        toast.error('Failed to parse workflow file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div
      className="h-12 flex items-center justify-between px-3 border-b flex-shrink-0 gap-2"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<PanelLeft size={14} />}
          onClick={() => setNodePaletteOpen(!nodePaletteOpen)}
          title="Toggle node palette"
          aria-label="Toggle node palette"
        />
        <div
          className="w-px h-5"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <input
          ref={nameRef}
          type="text"
          defaultValue={currentWorkflow?.name || 'Untitled Workflow'}
          className="text-[14px] font-medium bg-transparent border-none outline-none px-1.5 py-1 rounded-[var(--radius-sm)] transition-all duration-200 max-w-[200px]"
          style={{ color: 'var(--color-text-primary)' }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        />
        {isDirty && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--color-warning)' }}
            title="Unsaved changes"
          />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          icon={<Command size={14} />}
          onClick={() => setCommandPaletteOpen(true)}
          title="Command palette (Ctrl+K)"
        >
          <span className="hidden sm:inline">Ctrl+K</span>
        </Button>
        <div
          className="w-px h-5"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<Upload size={14} />}
          onClick={() => fileInputRef.current?.click()}
          title="Import workflow"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<Download size={14} />}
          onClick={handleExport}
          title="Export workflow"
        />
        <Button
          variant="secondary"
          size="sm"
          icon={<Save size={14} />}
          onClick={handleSave}
          loading={saving}
        >
          Save
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Play size={14} />}
          onClick={handleRun}
          loading={running}
          disabled={nodes.length === 0}
        >
          Run
        </Button>
      </div>
    </div>
  );
};
