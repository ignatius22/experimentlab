import Link from "next/link";
import { ArrowUpRight, Zap, Trophy, ShieldCheck, CheckCircle2 } from "lucide-react";

export function CoupSideWidgets({ flagsCount }: { flagsCount: number }) {
  return (
    <div className="row g-4">
      
      {/* 1. Coup Custom Promo Card */}
      <div className="col-12">
        <div 
          className="box rounded-4 p-4 text-white border-0 shadow-sm position-relative overflow-hidden" 
          style={{ background: "linear-gradient(135deg, #1b84ff 0%, #7239ea 100%)" }}
        >
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-white text-primary fw-bold text-uppercase" style={{ fontSize: "0.65rem" }}>
              Enterprise Fleet
            </span>
          </div>
          <h5 className="fw-bold mb-2">Maximize Feature Delivery &amp; Velocity</h5>
          <p className="text-white-50 small mb-3" style={{ lineHeight: 1.6 }}>
            Deterministic bucketing eliminates 100% of network roundtrips during feature evaluations.
          </p>
          <Link href="/app/proof" className="btn btn-light btn-sm fw-bold text-primary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1">
            <span>Explore Proof Sandbox</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Coup Breakdown Box */}
      <div className="col-12">
        <div className="box rounded-4 b-1">
          <div className="box-header b-0 pb-0">
            <h5 className="fw-bold text-dark m-0">Fleet Telemetry Mix</h5>
          </div>
          <div className="box-body">
            
            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark">Deterministic Flags</span>
                <span className="text-primary">{flagsCount} active (100%)</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark">Frequentist Confidence</span>
                <span className="text-success">99.7%</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: "99.7%" }}></div>
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark">Layout Shift (CLS)</span>
                <span className="text-info">0.00 (Zero Shift)</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-info" role="progressbar" style={{ width: "100%" }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
