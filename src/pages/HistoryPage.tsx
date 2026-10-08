// History page - run history list

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Loader2, CheckCircle2, XCircle, Clock, ChevronRight, X } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../lib/api';
import { useWorkflowStore } from '../stores/workflowStore';
import type { WorkflowRun } from '../types/run';

const HistoryPage: React.FC = () => {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  
  // We'd ideally load all runs for the user, but for now we'll load runs for the current workflow
  const { currentWorkflow } = useWorkflowStore();

  useEffect(() => {
    const fetchRuns = async () => {
      if (!currentWorkflow?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get<WorkflowRun[]>(`/runs/workflow/${currentWorkflow.id}`);
        setRuns(data);
      } catch (err) {
        console.error('Failed to load runs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRuns();
  }, [currentWorkflow]);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />;
      case 'failed': return <XCircle size={16} style={{ color: 'var(--color-error)' }} />;
      case 'running': return <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-accent)' }} />;
      default: return <Clock size={16} style={{ color: 'var(--color-text-tertiary)' }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex relative"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div
          className="h-14 flex items-center px-6 border-b flex-shrink-0"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
              <History size={16} />
            </div>
            <h1
              className="text-[16px] font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Run History {currentWorkflow ? `— ${currentWorkflow.name}` : ''}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : !currentWorkflow ? (
            <div className="pt-20">
              <EmptyState
                icon={History}
                title="No workflow selected"
                description="Go to the Canvas, create or select a workflow, then come back here to see its history."
              />
            </div>
          ) : runs.length === 0 ? (
            <div className="pt-20">
              <EmptyState
                icon={History}
                title="No runs yet"
                description="Run this workflow to see its execution history here."
              />
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto p-6">
              <div className="rounded-[var(--radius-xl)] border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Status</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Started At</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Duration</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--color-text-tertiary)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run, idx) => (
                      <tr 
                        key={run.id}
                        onClick={() => setSelectedRun(run)}
                        className="cursor-pointer transition-colors border-b last:border-b-0"
                        style={{ 
                          borderColor: 'var(--color-border)',
                          backgroundColor: selectedRun?.id === run.id ? 'var(--color-accent-soft)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedRun?.id !== run.id) e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          if (selectedRun?.id !== run.id) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            <span className="text-[13px] font-medium capitalize" style={{ color: 'var(--color-text-primary)' }}>
                              {run.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                          {formatDate(run.startedAt)}
                        </td>
                        <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                          {run.duration ? `${run.duration}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Run Detail Side Panel */}
      <AnimatePresence>
        {selectedRun && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 400 }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full border-l flex flex-col flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>Run Details</h3>
              <button 
                onClick={() => setSelectedRun(null)}
                className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer border-none bg-transparent transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-6">
                {selectedRun.logs?.length ? (
                  selectedRun.logs.map((log, i) => (
                    <div key={log.id} className="relative pl-6">
                      {/* Timeline line */}
                      {i !== selectedRun.logs!.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-[-24px] w-px" style={{ backgroundColor: 'var(--color-border)' }} />
                      )}
                      
                      {/* Timeline dot */}
                      <div 
                        className="absolute left-[3px] top-1.5 w-3 h-3 rounded-full border-2"
                        style={{ 
                          backgroundColor: 'var(--color-bg-secondary)',
                          borderColor: log.status === 'success' ? 'var(--color-success)' : 
                                       log.status === 'failed' ? 'var(--color-error)' : 
                                       'var(--color-accent)'
                        }}
                      />
                      
                      <div className="rounded-[var(--radius-md)] border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{log.nodeType}</div>
                          <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{log.duration ? `${log.duration}ms` : ''}</div>
                        </div>
                        
                        {log.error && (
                          <div className="mt-2 p-2 rounded text-[11px] font-mono break-all" style={{ backgroundColor: 'var(--color-error-soft)', color: 'var(--color-error)' }}>
                            {log.error}
                          </div>
                        )}
                        
                        {log.output && (
                          <div className="mt-2">
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Output</div>
                            <pre className="p-2 rounded text-[11px] font-mono overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                              {typeof log.output === 'object' ? JSON.stringify(log.output, null, 2) : String(log.output)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    No logs available for this run.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryPage;
