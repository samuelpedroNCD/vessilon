import { ReactNode } from "react";

export default function PageHeader({
  title,
  crumb,
  sub,
  actions,
}: {
  title: string;
  crumb?: string;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <div className="page-h">
        <h1>{title}</h1>
        {crumb && <span className="crumb">/ {crumb}</span>}
        {actions && <span className="page-actions">{actions}</span>}
      </div>
      {sub && <div className="page-sub">{sub}</div>}
    </>
  );
}
