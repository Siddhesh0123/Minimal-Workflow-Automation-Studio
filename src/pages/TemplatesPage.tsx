// Templates page - workflow templates gallery

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutTemplate, Play, ArrowRight, Loader2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useWorkflowStore } from '../stores/workflowStore';
import type { Workflow } from '../types/workflow';

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setCurrentWorkflow } = useWorkflowStore();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await api.get<Workflow[]>('/workflows');
        setTemplates(data.filter((w) => w.isTemplate));
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const useTemplate = (template: Workflow) => {
    // Clone as new workflow (without id and isTemplate flag)
    const newWorkflow = {
      ...template,
      id: '',
      isTemplate: false,
      name: `Copy of ${template.name}`,
    };
    setCurrentWorkflow(newWorkflow as Workflow);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
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
            <LayoutTemplate size={16} />
          </div>
          <h1
            className="text-[16px] font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Workflow Templates
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="No templates found"
            description="Templates are pre-configured workflows to help you get started quickly."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {templates.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="flex flex-col rounded-[var(--radius-xl)] overflow-hidden border group transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Visual Preview (Mocked) */}
                <div 
                  className="h-32 relative overflow-hidden border-b flex items-center justify-center gap-3"
                  style={{ 
                    backgroundColor: 'var(--color-bg-canvas)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-border) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  {/* Miniature node mockups based on length */}
                  {template.nodes.slice(0, 3).map((n, i) => (
                    <React.Fragment key={i}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center relative z-10 shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: n.data.category === 'trigger' ? 'var(--color-node-trigger-soft)' : 'var(--color-node-action-soft)' }} />
                      </div>
                      {i < Math.min(template.nodes.length, 3) - 1 && (
                        <div className="w-6 h-0.5 relative z-10" style={{ backgroundColor: 'var(--color-border)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {template.name}
                  </h3>
                  <p className="text-[13px] leading-relaxed mb-6 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {template.description}
                  </p>
                  
                  <Button 
                    variant="primary" 
                    className="w-full justify-center group-hover:bg-[var(--color-accent-hover)]"
                    icon={<Play size={14} />}
                    onClick={() => useTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TemplatesPage;
