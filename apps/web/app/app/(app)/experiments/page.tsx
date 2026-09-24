import Link from "next/link";
import { prisma } from "@experiment/db";
import { auth } from "@/lib/auth/server";
import { 
  FlaskConical, 
  Plus, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";

export default async function ExperimentsPage() {
  const { orgId } = await auth();

  const experiments = await prisma.experiment.findMany({
    where: { organizationId: orgId || undefined },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Coup Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Experiments</h3>
          <p className="text-muted m-0" style={{ fontSize: "0.875rem" }}>
            Compare variants, measure outcomes, and make decisions with confidence.
          </p>
        </div>
        <Link 
          href="/app/experiments/new"
          className="btn btn-coup-primary d-flex align-items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Create Experiment</span>
        </Link>
      </div>

      {/* Coup Experiments Table Box */}
      <div className="box rounded-4 b-1 shadow-sm">
        <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark m-0">All experiments</h5>
          <span className="small text-muted font-monospace">{experiments.length} total</span>
        </div>
        <div className="box-body px-0 pb-0">
          <div className="table-responsive">
            <table className="table table-hover m-0 text-nowrap align-middle">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="border-0 px-4 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Name</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Key</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Status</th>
                  <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Created</th>
                  <th className="border-0 px-4 py-3 text-end text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {experiments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <FlaskConical size={36} className="text-muted opacity-50 mb-2" />
                      <p className="m-0 fw-bold text-dark">No experiments configured</p>
                      <p className="text-muted small">Create your first A/B test to split traffic and evaluate significance.</p>
                    </td>
                  </tr>
                ) : (
                  experiments.map((exp) => {
                    const isRunning = exp.status?.toLowerCase() === "running" || exp.status?.toLowerCase() === "active";
                    const isCompleted = exp.status?.toLowerCase() === "completed";

                    return (
                      <tr key={exp.id}>
                        <td className="px-4">
                          <div className="d-flex align-items-center gap-2.5">
                            <div className="bg-primary-light text-primary p-2 rounded-3">
                              <FlaskConical size={16} />
                            </div>
                            <div>
                              <span className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{exp.name}</span>
                              <div className="text-muted small">
                                {Array.isArray(exp.variants) ? exp.variants.length : 2} variants configured
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-monospace text-primary fw-bold small bg-light px-2 py-1 rounded border">
                            {exp.key}
                          </span>
                        </td>
                        <td>
                          {isRunning ? (
                            <span className="badge badge-success-light rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-bold">
                              <span className="badge bg-success rounded-pill" style={{ width: 6, height: 6, padding: 0 }}></span>
                              Running
                            </span>
                          ) : isCompleted ? (
                            <span className="badge badge-primary-light rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-bold">
                              <CheckCircle2 size={13} />
                              Completed
                            </span>
                          ) : (
                            <span className="badge badge-warning-light rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-bold">
                              <Clock size={13} />
                              {exp.status || "Draft"}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="text-muted small font-monospace">
                            {new Date(exp.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 text-end">
                          <Link 
                            href={`/app/experiments/${exp.id}`}
                            className="btn btn-sm btn-light border fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 text-primary shadow-xs"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <span>View Results</span>
                            <ExternalLink size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
