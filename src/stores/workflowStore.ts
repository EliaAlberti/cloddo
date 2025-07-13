import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workflow, CreateWorkflowRequest } from '@/types';
import { invoke } from '@tauri-apps/api/core';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Workflow operations
  fetchWorkflows: () => Promise<void>;
  createWorkflow: (request: CreateWorkflowRequest) => Promise<Workflow>;
  updateWorkflow: (workflowId: string, request: CreateWorkflowRequest) => Promise<Workflow>;
  deleteWorkflow: (workflowId: string) => Promise<boolean>;
  triggerWorkflow: (workflowId: string, triggerData?: Record<string, any>) => Promise<string>;
  toggleWorkflow: (workflowId: string, enabled: boolean) => Promise<Workflow>;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      isLoading: false,
      error: null,

      // Actions
      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Workflow operations
      fetchWorkflows: async () => {
        try {
          set({ isLoading: true, error: null });
          const workflows = await invoke<Workflow[]>('get_workflows');
          set({ workflows });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },

      createWorkflow: async (request: CreateWorkflowRequest) => {
        try {
          set({ isLoading: true, error: null });
          const workflow = await invoke<Workflow>('create_workflow', { request });
          set((state) => ({ workflows: [workflow, ...state.workflows] }));
          return workflow;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateWorkflow: async (workflowId: string, request: CreateWorkflowRequest) => {
        try {
          set({ isLoading: true, error: null });
          const workflow = await invoke<Workflow>('update_workflow', { workflowId, request });
          set((state) => ({
            workflows: state.workflows.map((w) => (w.id === workflowId ? workflow : w)),
            currentWorkflow: state.currentWorkflow?.id === workflowId ? workflow : state.currentWorkflow,
          }));
          return workflow;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteWorkflow: async (workflowId: string) => {
        try {
          set({ isLoading: true, error: null });
          const success = await invoke<boolean>('delete_workflow', { workflowId });
          if (success) {
            set((state) => ({
              workflows: state.workflows.filter((w) => w.id !== workflowId),
              currentWorkflow: state.currentWorkflow?.id === workflowId ? null : state.currentWorkflow,
            }));
          }
          return success;
        } catch (error) {
          set({ error: error as string });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      triggerWorkflow: async (workflowId: string, triggerData?: Record<string, any>) => {
        try {
          set({ isLoading: true, error: null });
          const result = await invoke<string>('trigger_workflow', { workflowId, triggerData });
          return result;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      toggleWorkflow: async (workflowId: string, enabled: boolean) => {
        try {
          set({ isLoading: true, error: null });
          
          // Find the current workflow
          const currentWorkflow = get().workflows.find(w => w.id === workflowId);
          if (!currentWorkflow) {
            throw new Error('Workflow not found');
          }

          // Update the workflow with new enabled state
          const updateRequest: CreateWorkflowRequest = {
            name: currentWorkflow.name,
            description: currentWorkflow.description || undefined,
            triggerType: currentWorkflow.triggerType,
            triggerConfig: JSON.parse(currentWorkflow.triggerConfig || '{}'),
            actionType: currentWorkflow.actionType,
            actionConfig: JSON.parse(currentWorkflow.actionConfig || '{}'),
          };

          const workflow = await invoke<Workflow>('update_workflow', { workflowId, request: updateRequest });
          
          set((state) => ({
            workflows: state.workflows.map((w) => (w.id === workflowId ? { ...workflow, enabled } : w)),
            currentWorkflow: state.currentWorkflow?.id === workflowId ? { ...workflow, enabled } : state.currentWorkflow,
          }));
          
          return { ...workflow, enabled };
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'workflow-store',
      partialize: (state) => ({
        currentWorkflow: state.currentWorkflow,
      }),
    }
  )
);