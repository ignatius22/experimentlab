import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ExperimentProvider,
  useExperiment,
  useFlag,
  useManifest,
  useTrack,
} from "experimentlab-react";
import "./styles.css";

const config = {
  baseUrl: import.meta.env.VITE_EXPERIMENTLAB_URL || "http://localhost:3005",
  publishableKey: import.meta.env.VITE_EXPERIMENTLAB_CLIENT_KEY || "",
  flagKey: import.meta.env.VITE_FLAG_KEY || "new_checkout",
  experimentKey: import.meta.env.VITE_EXPERIMENT_KEY || "pricing_layout",
};

const demoUserId =
  new URLSearchParams(window.location.search).get("user")?.trim() ||
  "vite-demo-user-001";

function Demo() {
  const { manifest, loading } = useManifest();
  const newCheckout = useFlag(config.flagKey);
  const variant = useExperiment(config.experimentKey);
  const track = useTrack();
  const [eventQueued, setEventQueued] = useState(false);

  const handleCheckoutClick = () => {
    track("demo_checkout_clicked", {
      flag: config.flagKey,
      variant: variant?.name ?? null,
    });
    setEventQueued(true);
  };

  return (
    <main>
      <p className="eyebrow">ExperimentLab React SDK</p>
      <h1>
        Local evaluation,
        <br />
        visible results.
      </h1>
      <p className="lede">
        This Vite app downloads the manifest once, then evaluates flags and A/B
        assignments in the browser.
      </p>

      {!config.publishableKey && (
        <aside className="notice">
          Copy <code>.env.example</code> to <code>.env</code> and add a Client
          API key from ExperimentLab Settings.
        </aside>
      )}

      <section className="grid">
        <article>
          <span>Manifest</span>
          <strong>
            {loading ? "Loading…" : manifest ? "Ready" : "Not loaded"}
          </strong>
          <small>
            {manifest
              ? `${manifest.flags.length} flags · ${manifest.experiments.length} experiments`
              : "Check your URL and Client API key."}
          </small>
        </article>
        <article>
          <span>Feature flag</span>
          <strong>{newCheckout ? "Enabled" : "Disabled"}</strong>
          <small>
            <code>{config.flagKey}</code>
          </small>
        </article>
        <article>
          <span>Demo user</span>
          <strong>{demoUserId}</strong>
          <small>
            Add <code>?user=another-user</code> to the URL.
          </small>
        </article>
        <article>
          <span>Experiment</span>
          <strong>{variant?.name ?? "Not assigned"}</strong>
          <small>
            <code>{config.experimentKey}</code>
          </small>
        </article>
      </section>

      <section className="checkout">
        <div>
          <p className="eyebrow">Feature-flagged component</p>
          <h2>{newCheckout ? "One-click checkout" : "Standard checkout"}</h2>
          <p>
            {newCheckout
              ? "This variation is visible only when your local flag evaluation returns true."
              : "Turn on the flag or change its rollout in ExperimentLab to see the alternative."}
          </p>
        </div>
        <button onClick={handleCheckoutClick}>
          {eventQueued ? "Event queued" : "Track checkout click"}
        </button>
      </section>
    </main>
  );
}

function App() {
  return (
    <ExperimentProvider
      baseUrl={config.baseUrl}
      publishableKey={config.publishableKey}
      userId={demoUserId}
      context={{ plan: "pro", country: "NG" }}
    >
      <Demo />
    </ExperimentProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
