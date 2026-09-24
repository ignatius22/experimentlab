import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { ExperimentClient, EMPTY_STATE } from "experimentlab-core";
import type { ExperimentManifest, Variant, Event } from "experimentlab-core";

export { ExperimentClient, EMPTY_STATE } from "experimentlab-core";
export type { ExperimentManifest, Variant, Event } from "experimentlab-core";

const ExperimentContext = createContext<ExperimentClient | null>(null);

export interface ExperimentProviderProps {
  client?: ExperimentClient;
  publishableKey?: string;
  apiKey?: string;
  userId?: string;
  baseUrl?: string;
  context?: Record<string, any>;
  initialManifest?: ExperimentManifest;
  children: React.ReactNode;
}

export function ExperimentProvider({ 
  client, 
  publishableKey, 
  apiKey,
  userId, 
  baseUrl, 
  context, 
  initialManifest,
  children 
}: ExperimentProviderProps) {
  const effectiveKey = publishableKey || apiKey;
  const resolvedClient = useMemo(() => {
    if (client) return client;
    if (effectiveKey) {
      return new ExperimentClient({
        publishableKey: effectiveKey,
        userId: userId || "anonymous",
        baseUrl: baseUrl || "",
        context: context || {},
        initialManifest
      });
    }
    return null;
  }, [client, effectiveKey, userId, baseUrl]);

  useEffect(() => {
    if (resolvedClient && context) {
      resolvedClient.setContext(context);
    }
  }, [resolvedClient, context]);

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

export function useFlag(key: string, defaultValue = false): boolean {
  const client = useExperimentClient();
  useSyncExternalStore(
    (l: () => void) => (client ? client.subscribe(l) : () => {}),
    () => (client ? client.getSnapshot() : EMPTY_STATE),
    () => (client ? client.getSnapshot() : EMPTY_STATE)
  );
  if (!client) return defaultValue;
  const snapshot = client.getSnapshot();
  if (!snapshot.manifest) {
    return defaultValue;
  }
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
