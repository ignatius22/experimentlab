import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { ExperimentClient, EMPTY_STATE } from "experimentlab-core";
import type { ExperimentManifest, Variant, Event } from "experimentlab-core";

export { ExperimentClient, EMPTY_STATE } from "experimentlab-core";
export type { ExperimentManifest, Variant, Event } from "experimentlab-core";

const ExperimentContext = createContext<ExperimentClient | null>(null);

export interface ExperimentProviderProps {
  client?: ExperimentClient;
  publishableKey?: string;
  userId?: string;
  baseUrl?: string;
  context?: Record<string, any>;
  children: React.ReactNode;
}

export function ExperimentProvider({ 
  client, 
  publishableKey, 
  userId, 
  baseUrl, 
  context, 
  children 
}: ExperimentProviderProps) {
  const resolvedClient = useMemo(() => {
    if (client) return client;
    if (publishableKey) {
      return new ExperimentClient({
        publishableKey,
        userId: userId || "anonymous",
        baseUrl: baseUrl || "",
        context: context || {}
      });
    }
    return null;
  }, [client, publishableKey, userId, baseUrl]);

  useEffect(() => {
    if (resolvedClient) {
      resolvedClient.init().catch(() => {});
    }
  }, [resolvedClient]);

  return (
    <ExperimentContext.Provider value={resolvedClient}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperimentClient(): ExperimentClient | null {
  return useContext(ExperimentContext);
}

export function useFlag(key: string): boolean {
  const client = useExperimentClient();
  useSyncExternalStore(
    (l: () => void) => (client ? client.subscribe(l) : () => {}),
    () => (client ? client.getSnapshot() : EMPTY_STATE),
    () => (client ? client.getSnapshot() : EMPTY_STATE)
  );
  if (!client) return false;
  return client.getFlag(key);
}

export function useExperiment(key: string): Variant | null {
  const client = useExperimentClient();
  useSyncExternalStore(
    (l: () => void) => (client ? client.subscribe(l) : () => {}),
    () => (client ? client.getSnapshot() : EMPTY_STATE),
    () => (client ? client.getSnapshot() : EMPTY_STATE)
  );
  if (!client) return null;
  return client.getExperimentVariant(key);
}

export function useTrack() {
  const client = useExperimentClient();
  return (name: string, payload?: Record<string, any>) => {
    if (client) {
      client.track(name, payload);
    }
  };
}

export function useManifest() {
  const client = useExperimentClient();
  const state = useSyncExternalStore(
    (l: () => void) => (client ? client.subscribe(l) : () => {}),
    () => (client ? client.getSnapshot() : EMPTY_STATE),
    () => (client ? client.getSnapshot() : EMPTY_STATE)
  );
  return { manifest: state.manifest, loading: state.loading };
}
