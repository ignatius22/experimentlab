"use client";

import { useState } from "react";
import { Badge, Button, Card, Input, Modal, Switch, Table, THead, TBody, TR, TH, TD } from "@experiment/ui";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="stack" style={{ gap: "var(--space-8)" }}>
      <header>
        <h1 style={{ fontSize: "2rem" }}>Design System</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Reusable primitives for the ExperimentLab SaaS.</p>
      </header>

      <div className="stack" style={{ gap: "var(--space-6)" }}>
        <h3>Buttons & Form</h3>
        <Card>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Button>Primary Action</Button>
            <Button style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>Secondary</Button>
            <Button style={{ background: "var(--color-danger)" }}>Danger</Button>
            <Input placeholder="Search experiments..." style={{ maxWidth: 300 }} />
          </div>
        </Card>

        <h3>Status & Feedback</h3>
        <Card>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span className="badge badge-success">Running</span>
            <span className="badge badge-warning">Paused</span>
            <span className="badge badge-danger">Archived</span>
            <span className="badge badge-neutral">Draft</span>
            <Switch checked={true} onChange={() => {}} />
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </div>
        </Card>

        <h3>Data Presentation</h3>
        <Table>
          <THead>
            <TR>
              <TH>Column A</TH>
              <TH>Column B</TH>
              <TH>Column C</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TD>Data Item 1</TD>
              <TD><span className="badge badge-success">Active</span></TD>
              <TD style={{ color: "var(--color-text-dim)" }}>Yesterday</TD>
            </TR>
            <TR>
              <TD>Data Item 2</TD>
              <TD><span className="badge badge-neutral">Inactive</span></TD>
              <TD style={{ color: "var(--color-text-dim)" }}>Just now</TD>
            </TR>
          </TBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sample Dialog">
        <div className="stack" style={{ marginTop: 16 }}>
          <p>This is a standard modal component used for creation and confirmation flows.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

