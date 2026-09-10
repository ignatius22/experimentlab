"use client";

import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`ui-table-container ${className}`.trim()}>
      <table className="ui-table">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="ui-thead">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="ui-tbody">{children}</tbody>;
}

export function TR({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  const classes = `ui-tr ${onClick ? "ui-tr-clickable" : ""} ${className}`.trim();
  return (
    <tr onClick={onClick} className={classes}>
      {children}
    </tr>
  );
}

export function TH({ children, className = "", style }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <th className={`ui-th ${className}`.trim()} style={style}>{children}</th>;
}

export function TD({ children, className = "", colSpan, style }: { children: React.ReactNode; className?: string; colSpan?: number; style?: React.CSSProperties }) {
  return <td colSpan={colSpan} className={`ui-td ${className}`.trim()} style={style}>{children}</td>;
}

