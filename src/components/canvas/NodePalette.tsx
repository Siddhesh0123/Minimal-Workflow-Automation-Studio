// Node palette - draggable node list grouped by category

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { NODE_CATEGORIES, NODE_TYPE_CONFIGS } from '../../lib/constants';
import type { FlowNodeType, NodeCategory } from '../../types/node';

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  Clock, Webhook, Play, Globe, Mail, Wand2, FileOutput, GitBranch, Timer,
};

const categoryOrder: NodeCategory[] = ['trigger', 'action', 'logic'];

interface NodePaletteProps {
  isOpen: boolean;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ isOpen }) => {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    trigger: true,
    action: true,
    logic: true,
  });

  const onDragStart = (
    event: React.DragEvent,
    nodeType: FlowNodeType
  ) => {
    event.dataTransfer.setData('application/flowline-node', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-[220px] h-full flex flex-col border-r overflow-y-auto flex-shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Nodes
        </h3>
      </div>

      <div className="flex-1 py-2">
        {categoryOrder.map((category, catIdx) => {
          const catConfig = NODE_CATEGORIES[category];
          const nodes = Object.entries(NODE_TYPE_CONFIGS).filter(
            ([, config]) => config.category === category
          );

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.08, duration: 0.3 }}
              className="mb-1"
            >
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-2 cursor-pointer border-none bg-transparent"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {catConfig.label}
                </span>
                <motion.div
                  animate={{ rotate: expanded[category] ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} />
                </motion.div>
              </button>

              {/* Nodes */}
              <AnimatePresence>
                {expanded[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {nodes.map(([nodeType, config], idx) => {
                      const Icon = iconMap[config.icon] || Play;
                      return (
                        <motion.div
                          key={nodeType}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e as unknown as React.DragEvent, nodeType as FlowNodeType)
                          }
                          className="flex items-center gap-2 mx-2 px-2 py-1.5 rounded-[var(--radius-md)] cursor-grab active:cursor-grabbing transition-all duration-150 group"
                          style={{
                            color: 'var(--color-text-primary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'var(--color-bg-tertiary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                          }}
                        >
                          <GripVertical
                            size={10}
                            className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          />
                          <div
                            className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: catConfig.softColor,
                              color: catConfig.color,
                            }}
                          >
                            <Icon size={13} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium truncate">
                              {config.label}
                            </div>
                            <div
                              className="text-[10px] truncate"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              {config.description}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
