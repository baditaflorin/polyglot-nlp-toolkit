import { workspaceStateSchema, type WorkspaceState } from './schema';
import { defaultWorkspace } from './workspace';

const storageKey = 'polyglot-workspace-v1';

export type WorkspaceLoadResult = {
  workspace: WorkspaceState;
  warning?: string;
};

export function loadWorkspace(): WorkspaceLoadResult {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return { workspace: defaultWorkspace };
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    return { workspace: migrateWorkspace(parsed) };
  } catch (error) {
    return {
      workspace: defaultWorkspace,
      warning:
        error instanceof Error
          ? `Saved workspace could not be restored: ${error.message}`
          : 'Saved workspace could not be restored.',
    };
  }
}

export function saveWorkspace(workspace: WorkspaceState) {
  window.localStorage.setItem(storageKey, JSON.stringify(workspaceStateSchema.parse(workspace)));
}

export function clearWorkspace() {
  window.localStorage.removeItem(storageKey);
}

export function migrateWorkspace(value: unknown): WorkspaceState {
  const parsed = workspaceStateSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  throw new Error(parsed.error.issues.map((issue) => issue.message).join('; '));
}
