// Run history store

import { create } from 'zustand';
import type { WorkflowRun } from '../types/run';

interface HistoryState {
  runs: WorkflowRun[];
  selectedRun: WorkflowRun | null;
  loading: boolean;

  setRuns: (runs: WorkflowRun[]) => void;
  addRun: (run: WorkflowRun) => void;
  updateRun: (runId: string, updates: Partial<WorkflowRun>) => void;
  setSelectedRun: (run: WorkflowRun | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  runs: [],
  selectedRun: null,
  loading: false,

  setRuns: (runs) => set({ runs }),

  addRun: (run) => set({ runs: [run, ...get().runs] }),

  updateRun: (runId, updates) =>
    set({
      runs: get().runs.map((r) =>
        r.id === runId ? { ...r, ...updates } : r
      ),
      selectedRun:
        get().selectedRun?.id === runId
          ? { ...get().selectedRun!, ...updates }
          : get().selectedRun,
    }),

  setSelectedRun: (run) => set({ selectedRun: run }),
  setLoading: (loading) => set({ loading }),
}));
