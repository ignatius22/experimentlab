import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { ExperimentClient, EMPTY_STATE } from "@experiment/sdk-core";

const ExperimentContext = createContext<ExperimentClient | null>(null);

export interface ExperimentProviderProps {
  client: ExperimentClient;
  children: React.ReactNode;
}

export function ExperimentProvider({ client, children }: ExperimentProviderProps) {
  useEffect(() => {
    client.init();
  }, [client]);

  return (
    <ExperimentContext.Provider value={client}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperimentClient() {
  return useContext(ExperimentContext);
}

export function useFlag(key: string): boolean {
  const client = useExperimentClient();
  useSyncExternalStore(
    (l: () => void) => client ? client.subscribe(l) : () => {},
    () => client ? client.getSnapshot() : EMPTY_STATE,
    () => client ? client.getSnapshot() : EMPTY_STATE
  );
  return client ? client.getFlag(key) : false;
}

export function useExperiment(key: string) {
  const client = useExperimentClient();
  useSyncExternalStore(
    (l: () => void) => client ? client.subscribe(l) : () => {},
    () => client ? client.getSnapshot() : EMPTY_STATE,
    () => client ? client.getSnapshot() : EMPTY_STATE
  );
  return client ? client.getExperimentVariant(key) : null;
}

export function useTrack() {
  const client = useExperimentClient();
  return (name: string, payload?: Record<string, any>) => client?.track(name, payload);
}

export function useSetContext() {
  const client = useExperimentClient();
  return (context: Record<string, any>) => client?.setContext(context);
}

export function useManifest() {
  const client = useExperimentClient();
  const state = useSyncExternalStore(
    (l: () => void) => client ? client.subscribe(l) : () => {},
    () => client ? client.getSnapshot() : EMPTY_STATE,
    () => client ? client.getSnapshot() : EMPTY_STATE
  );
  return { manifest: state.manifest, loading: state.loading };
}
