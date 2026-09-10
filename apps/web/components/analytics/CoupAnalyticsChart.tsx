"use client";

import { useState, useEffect } from "react";
import { TrendingUp, BarChart2, CheckCircle2, Zap, RefreshCw } from "lucide-react";

interface CoupAnalyticsChartProps {
  flagsCount: number;
  experimentsCount: number;
  eventsCount: number;
}

interface TrendBucket {
  label: string;
  evaluations: number;
  conversions: number;
}

export function CoupAnalyticsChart({ flagsCount, experimentsCount, eventsCount }: CoupAnalyticsChartProps) {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [data, setData] = useState<TrendBucket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrends = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/trends?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(range);
  }, [range]);

  const maxVal = Math.max(...data.map(d => Math.max(d.evaluations, d.conversions)), 10);
  const totalEvaluations = data.reduce((sum, d) => sum + d.evaluations, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
  const convRate = totalEvaluations > 0 ? ((totalConversions / totalEvaluations) * 100).toFixed(1) : "0.0";

  return (
    <div className="box rounded-4 b-1 shadow-sm">
      {/* Coup Box Header with Range Toggle */}
      <div className="box-header b-0 pb-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold text-dark m-0">Live Experimentation &amp; Telemetry Analytics</h4>
            {loading && <RefreshCw size={14} className="animate-spin text-primary" />}
          </div>
          <p className="text-muted small m-0">
            Direct real-time aggregation of deterministic evaluations and goal conversions from PostgreSQL
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm p-1 bg-light rounded-pill border">
            <button 
              type="button" 
              onClick={() => setRange("daily")}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${range === "daily" ? "btn-primary text-white shadow-xs" : "btn-light text-muted border-0"}`}
            >
              Daily
            </button>
            <button 
              type="button" 
              onClick={() => setRange("weekly")}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${range === "weekly" ? "btn-primary text-white shadow-xs" : "btn-light text-muted border-0"}`}
            >
              Weekly
            </button>
            <button 
              type="button" 
              onClick={() => setRange("monthly")}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${range === "monthly" ? "btn-primary text-white shadow-xs" : "btn-light text-muted border-0"}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="box-body">
        {/* Visual Coup SVG Area & Bar Chart */}
        <div className="d-flex align-items-end justify-content-between gap-3 pt-4 pb-2 border-bottom" style={{ height: 260 }}>
          {data.map((item, idx) => {
            const expHeight = item.evaluations > 0 ? Math.round((item.evaluations / maxVal) * 100) : 4;
            const convHeight = item.conversions > 0 ? Math.round((item.conversions / maxVal) * 100) : 4;

            return (
              <div key={idx} className="flex-grow-1 d-flex flex-column align-items-center justify-content-end h-100 position-relative group">
                {/* Metric Bars Container */}
                <div className="w-100 d-flex justify-content-center align-items-end gap-1.5 h-100" style={{ maxWidth: 48 }}>
                  {/* Conversions bar */}
                  <div 
                    className="w-50 rounded-top bg-success opacity-85 position-relative"
                    style={{ height: `${convHeight}%`, minHeight: 4, transition: "height 0.5s ease" }}
                    title={`Conversions: ${item.conversions}`}
                  />
                  {/* Evaluations bar */}
                  <div 
                    className="w-50 rounded-top bg-primary position-relative"
                    style={{ height: `${expHeight}%`, minHeight: 4, transition: "height 0.5s ease" }}
                    title={`Exposures: ${item.evaluations}`}
                  />
                </div>
                <span className="text-muted fw-bold mt-2 font-monospace" style={{ fontSize: "0.75rem" }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend & Summary Row */}
        <div className="row text-center pt-3 g-3 align-items-center">
          <div className="col-md-3 col-6">
            <div className="d-flex align-items-center justify-content-center gap-1.5">
              <span className="badge bg-primary rounded-circle" style={{ width: 8, height: 8, padding: 0 }}></span>
              <span className="text-muted small fw-semibold">Exposures:</span>
              <strong className="text-dark font-monospace">{totalEvaluations}</strong>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex align-items-center justify-content-center gap-1.5">
              <span className="badge bg-success rounded-circle" style={{ width: 8, height: 8, padding: 0 }}></span>
              <span className="text-muted small fw-semibold">Conversions:</span>
              <strong className="text-success font-monospace">{totalConversions}</strong>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex align-items-center justify-content-center gap-1.5">
              <span className="text-muted small fw-semibold">Conversion Rate:</span>
              <strong className="text-primary font-monospace">{convRate}%</strong>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex align-items-center justify-content-center gap-1.5">
              <span className="text-muted small fw-semibold">Active Model:</span>
              <strong className="text-dark font-monospace small">Two-Tailed Z</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
