// Command Palette (Cmd+K)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Workflow, History, LayoutTemplate, Sun, Moon, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { NODE_TYPE_CONFIGS } from '../../lib/constants';
import { createFlowNode } from '../nodes/nodeTypes';
import type { FlowNodeType } from '../../types/node';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, theme, toggleTheme } = useUIStore();
  const { addNode } = useWorkflowStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [commandPaletteOpen]);
  
  if (!commandPaletteOpen) return null;
  
  const handleClose = () => setCommandPaletteOpen(false);
  
  const nodesEntries = Object.entries(NODE_TYPE_CONFIGS);
  
  const filteredNodes = nodesEntries.filter(([, config]) => 
    config.label.toLowerCase().includes(query.toLowerCase()) || 
    config.description.toLowerCase().includes(query.toLowerCase())
  );
  
  const actions = [
    { id: 'nav-canvas', label: 'Go to Canvas', icon: Workflow, onSelect: () => navigate('/') },
    { id: 'nav-history', label: 'Go to History', icon: History, onSelect: () => navigate('/history') },
    { id: 'nav-templates', label: 'Go to Templates', icon: LayoutTemplate, onSelect: () => navigate('/templates') },
    { id: 'toggle-theme', label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, icon: theme === 'light' ? Moon : Sun, onSelect: toggleTheme },
  ].filter(action => action.label.toLowerCase().includes(query.toLowerCase()));

  const executeAction = (action: () => void) => {
    action();
    handleClose();
  };
  
  const executeAddNode = (nodeType: string) => {
    // Add to center of screen roughly
    const newNode = createFlowNode(nodeType as FlowNodeType, { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 });
    addNode(newNode);
    handleClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={handleClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[500px] overflow-hidden rounded-[var(--radius-xl)] flex flex-col shadow-[var(--shadow-lg)]"
          style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            maxHeight: '60vh'
          }}
        >
          <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <Search size={18} style={{ color: 'var(--color-text-tertiary)' }} />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none px-3 text-[14px]"
              style={{ color: 'var(--color-text-primary)' }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleClose();
              }}
            />
            <div className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}>ESC</div>
          </div>
          
          <div className="overflow-y-auto p-2" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {query && filteredNodes.length === 0 && actions.length === 0 && (
              <div className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                No results found.
              </div>
            )}
            
            {filteredNodes.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                  Add Node
                </div>
                {filteredNodes.map(([nodeType, config]) => (
                  <div 
                    key={nodeType}
                    onClick={() => executeAddNode(nodeType)}
                    className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] cursor-pointer transition-colors group"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                        <Plus size={14} style={{ color: 'var(--color-text-secondary)' }} />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{config.label}</div>
                        <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{config.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {actions.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                  Actions
                </div>
                {actions.map((action) => (
                  <div 
                    key={action.id}
                    onClick={() => executeAction(action.onSelect)}
                    className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] cursor-pointer transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                        <action.icon size={14} style={{ color: 'var(--color-text-secondary)' }} />
                      </div>
                      <div className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{action.label}</div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
