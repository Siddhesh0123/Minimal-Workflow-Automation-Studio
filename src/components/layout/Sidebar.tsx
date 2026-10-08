// Sidebar navigation component

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  History,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useUIStore } from '../../stores/uiStore';

const navItems = [
  { to: '/', icon: Workflow, label: 'Canvas' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      className="h-screen flex flex-col border-r"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
      animate={{ width: sidebarCollapsed ? 60 : 200 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Workflow size={14} color="white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="text-[15px] font-semibold whitespace-nowrap"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Flowline
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="no-underline"
            end={item.to === '/'}
          >
            {({ isActive }) => (
              <div
                className="flex items-center gap-2.5 px-2.5 h-9 rounded-[var(--radius-md)] transition-all duration-200 relative"
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-accent-soft)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-accent)'
                    : 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-bg-tertiary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="flex flex-col gap-1.5 p-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className={`flex ${sidebarCollapsed ? 'flex-col' : 'flex-row'} items-center gap-1.5`}>
          <ThemeToggle />
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center transition-colors duration-200 cursor-pointer border-none"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
