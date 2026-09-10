import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ExperimentLab",
  description: "Self-hosted feature flags, experiments, analytics, and web performance.",
  metadataBase: new URL("https://example.com"),
  icons: { icon: "/brand/experimentlab-mark.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
