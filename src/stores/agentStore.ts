import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, AgentRun, CreateAgentRequest } from '@/types';
import { invoke } from '@tauri-apps/api/core';

interface AgentState {
  agents: Agent[];
  currentAgent: Agent | null;
  agentRuns: AgentRun[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Agent operations
  fetchAgents: () => Promise<void>;
  createAgent: (request: CreateAgentRequest) => Promise<Agent>;
  updateAgent: (agentId: string, request: CreateAgentRequest) => Promise<Agent>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  runAgent: (agentId: string, inputData?: Record<string, any>) => Promise<string>;

  // Agent run operations
  fetchAgentRuns: (agentId?: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      currentAgent: null,
      agentRuns: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentAgent: (agent) => set({ currentAgent: agent }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Agent operations
      fetchAgents: async () => {
        try {
          set({ isLoading: true, error: null });
          const agents = await invoke<Agent[]>('get_agents');
          set({ agents });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },

      createAgent: async (request: CreateAgentRequest) => {
        try {
          set({ isLoading: true, error: null });
          const agent = await invoke<Agent>('create_agent', { request });
          set((state) => ({ agents: [agent, ...state.agents] }));
          return agent;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateAgent: async (agentId: string, request: CreateAgentRequest) => {
        try {
          set({ isLoading: true, error: null });
          const agent = await invoke<Agent>('update_agent', { agentId, request });
          set((state) => ({
            agents: state.agents.map((a) => (a.id === agentId ? agent : a)),
            currentAgent: state.currentAgent?.id === agentId ? agent : state.currentAgent,
          }));
          return agent;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAgent: async (agentId: string) => {
        try {
          set({ isLoading: true, error: null });
          const success = await invoke<boolean>('delete_agent', { agentId });
          if (success) {
            set((state) => ({
              agents: state.agents.filter((a) => a.id !== agentId),
              currentAgent: state.currentAgent?.id === agentId ? null : state.currentAgent,
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

      runAgent: async (agentId: string, inputData?: Record<string, any>) => {
        try {
          set({ isLoading: true, error: null });
          const runId = await invoke<string>('run_agent', { agentId, inputData });
          
          // Refresh agent runs to show the new run
          await get().fetchAgentRuns(agentId);
          
          return runId;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Agent run operations
      fetchAgentRuns: async () => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement get_agent_runs command in backend
          const agentRuns: AgentRun[] = [];
          set({ agentRuns });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'agent-store',
      partialize: (state) => ({
        currentAgent: state.currentAgent,
      }),
    }
  )
);