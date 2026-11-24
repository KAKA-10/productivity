'use client';

import { createContext, useContext } from 'react';

export type ActiveWorkspace = {
  id: string;
  name: string;
  organisation: string;
};

const WorkspaceContext = createContext<ActiveWorkspace | null>(null);

export const WorkspaceProvider = WorkspaceContext.Provider;

export function useActiveWorkspace() {
  return useContext(WorkspaceContext);
}
