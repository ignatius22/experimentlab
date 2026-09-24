import Link from "next/link";
import { prisma } from "@experiment/db";
import { Eye, ArrowRight, CheckCircle, Clock, PlayCircle } from "lucide-react";

export async function CoupRecentExperimentsTable({ orgId }: { orgId: string }) {
  const experiments = await prisma.experiment.findMany({
    where: { organizationId: orgId },
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="box rounded-4 b-1">
      <div className="box-header no-border pb-0 d-flex justify-content-between align-items-center">
        <h4 className="fw-bold text-dark m-0">Recent A/B Experiments &amp; Tests</h4>
        <Link href="/app/experiments" className="text-primary text-decoration-none fw-bold small d-flex align-items-center gap-1">
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="box-body px-0 pb-0">
        <div className="table-responsive">
          <table className="table table-hover m-0 text-nowrap align-middle">
            <thead className="bg-light text-muted">
              <tr>
                <th className="border-0 px-4 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Experiment</th>
                <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Target Metric</th>
                <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Variants</th>
                <th className="border-0 py-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Status</th>
                <th className="border-0 px-4 py-3 text-end text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No experiments created yet. Launch your first A/B test!
                  </td>
                </tr>
              ) : (
                experiments.map((exp) => {
                  const variantsCount = Array.isArray(exp.variants) ? exp.variants.length : 2;
                  const metricName = Array.isArray(exp.metrics) && exp.metrics.length > 0 ? exp.metrics[0] : "conversion_rate";
                  const isRunning = exp.status?.toLowerCase() === "running" || exp.status?.toLowerCase() === "active";

                  return (
                    <tr key={exp.id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">{exp.name}</div>
                        <div className="text-muted font-monospace small">{exp.key}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          {metricName}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold text-secondary">
                          {variantsCount} Variants
                        </span>
                      </td>
                      <td>
                        {isRunning ? (
                          <span className="badge badge-success-light rounded-pill d-inline-flex align-items-center gap-1 px-3 py-1.5 fw-bold">
                            <span className="badge bg-success rounded-pill" style={{ width: 6, height: 6, padding: 0 }}></span>
                            Running
                          </span>
                        ) : (
                          <span className="badge badge-warning-light rounded-pill d-inline-flex align-items-center gap-1 px-3 py-1.5 fw-bold">
                            <Clock size={12} />
                            {exp.status || "Draft"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 text-end">
                        <Link href={`/app/experiments/${exp.id}`} className="btn btn-sm btn-light border p-1.5 text-primary" title="View Experiment">
                          <Eye size={16} />
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
  );
}
