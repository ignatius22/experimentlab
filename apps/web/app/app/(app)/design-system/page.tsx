"use client";

import { Badge, Button, Card, Input, Modal, Switch } from "@experiment/ui";

export default function DesignSystemPage() {
  return (
    <section className="stack">
      <h2>Design System</h2>
      <div className="grid">
        <Card><Button>Primary Button</Button></Card>
        <Card><Input placeholder="Input field" aria-label="Demo input" /></Card>
        <Card><Badge>Badge</Badge></Card>
        <Card><Switch checked={true} onChange={() => {}} label="Toggle" /></Card>
        <Card><Modal open={false} title="Dialog" onClose={() => {}}>Dialog Body</Modal></Card>
      </div>
    </section>
  );
}

