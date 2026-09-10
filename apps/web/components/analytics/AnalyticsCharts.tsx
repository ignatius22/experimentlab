"use client";

import { Activity, TrendingUp, BarChart2 } from "lucide-react";

interface TimeBucket {
  timeLabel: string;
  exposure: number;
  track: number;
  page: number;
  total: number;
}

interface AnalyticsChartsProps {
  events: Array<{
    id: string;
    type: string;
    timestamp: string;
    payload?: any;
  }>;
}

export function AnalyticsCharts({ events }: AnalyticsChartsProps) {
  // 1. Calculate event distribution
  const typeCounts = events.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEvents = events.length || 1;
  const exposures = typeCounts["exposure"] || 0;
  const tracks = typeCounts["track"] || 0;
  const pages = typeCounts["page"] || 0;

  // 2. Bucket events into time intervals (last 12 buckets)
  const buckets: TimeBucket[] = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(Date.now() - (11 - i) * 60 * 1000);
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { timeLabel, exposure: 0, track: 0, page: 0, total: 0 };
  });

  // Populate time buckets
  events.forEach(e => {
    const eventTime = new Date(e.timestamp).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - eventTime) / 60000);
    if (diffMinutes >= 0 && diffMinutes < 12) {
      const bucketIdx = 11 - diffMinutes;
      if (buckets[bucketIdx]) {
        if (e.type === "exposure") buckets[bucketIdx].exposure++;
        else if (e.type === "track") buckets[bucketIdx].track++;
        else if (e.type === "page") buckets[bucketIdx].page++;
        buckets[bucketIdx].total++;
      }
    }
  });

  const maxBucketVal = Math.max(...buckets.map(b => b.total), 5);

  return (
    <div className="row g-4 mb-4">
      {/* Box 1: Real-Time Event Volume Bar Chart */}
      <div className="col-lg-8 col-12">
        <div className="box rounded-4 b-1 h-100 d-flex flex-column justify-content-between">
          <div className="box-header b-0 pb-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-pill" style={{ width: 8, height: 8, padding: 0 }}></span>
                <span>Event volume</span>
              </h5>
              <p className="text-muted small m-0">Events received per minute</p>
            </div>
            <div className="d-flex align-items-center gap-3 small">
              <span className="d-flex align-items-center gap-1.5 text-primary fw-semibold">
                <span className="badge bg-primary rounded-circle" style={{ width: 7, height: 7, padding: 0 }}></span>
                Exposures
              </span>
              <span className="d-flex align-items-center gap-1.5 text-success fw-semibold">
                <span className="badge bg-success rounded-circle" style={{ width: 7, height: 7, padding: 0 }}></span>
                Conversions
              </span>
              <span className="d-flex align-items-center gap-1.5 fw-semibold" style={{ color: "#7239ea" }}>
                <span className="badge rounded-circle" style={{ width: 7, height: 7, padding: 0, backgroundColor: "#7239ea" }}></span>
                Page Views
              </span>
            </div>
          </div>

          <div className="box-body">
            <div className="d-flex align-items-end justify-content-between gap-2 pt-4 pb-2 border-bottom" style={{ height: 180 }}>
              {buckets.map((b, idx) => {
                const expHeight = (b.exposure / maxBucketVal) * 100;
                const trackHeight = (b.track / maxBucketVal) * 100;
                const pageHeight = (b.page / maxBucketVal) * 100;
                const hasData = b.total > 0;

                return (
                  <div key={idx} className="flex-grow-1 d-flex flex-column align-items-center justify-content-end h-100 position-relative group">
                    <div className="w-100 bg-light rounded-top d-flex flex-column justify-content-end overflow-hidden h-100" style={{ maxWidth: 32 }}>
                      {hasData ? (
                        <>
                          <div style={{ height: `${pageHeight}%`, backgroundColor: "#7239ea" }} className="w-100" />
                          <div style={{ height: `${trackHeight}%` }} className="w-100 bg-success" />
                          <div style={{ height: `${expHeight}%` }} className="w-100 bg-primary" />
                        </>
                      ) : (
                        <div style={{ height: "4%" }} className="w-100 bg-secondary bg-opacity-25 rounded-top" />
                      )}
                    </div>
                    <span className="text-muted font-monospace mt-2" style={{ fontSize: "0.7rem" }}>{b.timeLabel.split(':')[1]}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Box 2: Telemetry Breakdown Mix */}
      <div className="col-lg-4 col-12">
        <div className="box rounded-4 b-1 h-100 d-flex flex-column justify-content-between">
          <div className="box-header b-0 pb-0">
            <h5 className="fw-bold text-dark m-0">Event breakdown</h5>
            <p className="text-muted small m-0">Distribution by event category</p>
          </div>

          <div className="box-body">
            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark d-flex align-items-center gap-1.5">
                  <span className="badge bg-primary rounded-circle" style={{ width: 7, height: 7, padding: 0 }}></span>
                  Exposures
                </span>
                <span className="text-primary font-monospace">{exposures} ({Math.round((exposures / totalEvents) * 100)}%)</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(exposures / totalEvents) * 100}%` }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark d-flex align-items-center gap-1.5">
                  <span className="badge bg-success rounded-circle" style={{ width: 7, height: 7, padding: 0 }}></span>
                  Conversions (Track)
                </span>
                <span className="text-success font-monospace">{tracks} ({Math.round((tracks / totalEvents) * 100)}%)</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${(tracks / totalEvents) * 100}%` }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-dark d-flex align-items-center gap-1.5">
                  <span className="badge rounded-circle" style={{ width: 7, height: 7, padding: 0, backgroundColor: "#7239ea" }}></span>
                  Page Views
                </span>
                <span className="font-monospace" style={{ color: "#7239ea" }}>{pages} ({Math.round((pages / totalEvents) * 100)}%)</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${(pages / totalEvents) * 100}%`, backgroundColor: "#7239ea" }}></div>
              </div>
            </div>
          </div>

          <div className="box-footer bg-light rounded-bottom-4 d-flex justify-content-between align-items-center py-2.5 px-3">
            <span className="small text-muted">Events shown</span>
            <strong className="text-dark font-monospace">{events.length.toLocaleString()} events</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
