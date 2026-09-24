# ExperimentLab React SDK demo

A minimal Vite application that uses the published `experimentlab-react` SDK. It fetches the manifest once, evaluates flags locally, records experiment exposure automatically, and queues a custom event when the button is clicked.

## Run it

```bash
cd examples/react-sdk-demo
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

In `.env`, set `VITE_EXPERIMENTLAB_CLIENT_KEY` to an ExperimentLab **Client** API key created from Settings → API keys. Do not use a Server key in a browser app. The example defaults to an ExperimentLab instance at `http://localhost:3005`.

Create a feature flag matching `VITE_FLAG_KEY` and an active experiment matching `VITE_EXPERIMENT_KEY`, or change those values to match existing keys in your workspace.
