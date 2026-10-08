// Canvas page - main workflow editor

import React from 'react';
import { motion } from 'framer-motion';
import { Toolbar } from '../components/canvas/Toolbar';
import { NodePalette } from '../components/canvas/NodePalette';
import { FlowCanvas } from '../components/canvas/FlowCanvas';
import { InspectorPanel } from '../components/canvas/InspectorPanel';
import { useUIStore } from '../stores/uiStore';

import { useKeyboard } from '../hooks/useKeyboard';
import { CommandPalette } from '../components/canvas/CommandPalette'; // Will create next

const CanvasPage: React.FC = () => {
  const { nodePaletteOpen } = useUIStore();

  
  // Use keyboard shortcuts
  useKeyboard();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col relative"
      style={{ backgroundColor: 'var(--color-bg-canvas)' }}
    >
      {/* Toolbar */}
      <Toolbar />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette isOpen={nodePaletteOpen} />
        
        <FlowCanvas />
        
        <InspectorPanel />
      </div>
      
      {/* Command Palette Modal */}
      <CommandPalette />
    </motion.div>
  );
};

export default CanvasPage;
