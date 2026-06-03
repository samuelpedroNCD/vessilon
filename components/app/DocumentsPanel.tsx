import { createClient } from "@/lib/supabase/server";
import { listDocuments, type EntityKind } from "@/lib/queries/documents";
import { deleteDocument } from "@/lib/actions/documents";
import { label } from "@/components/app/Pill";
import DocumentUpload from "@/components/app/DocumentUpload";

function ext(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return (m?.[1] ?? "doc").toUpperCase().slice(0, 4);
}

export default async function DocumentsPanel({
  entity,
  entityId,
  revalidate,
}: {
  entity: EntityKind;
  entityId: string;
  revalidate: string;
}) {
  const supabase = await createClient();
  const docs = await listDocuments(supabase, entity, entityId);

  return (
    <div className="panel">
      <div className="panel-h">
        <h4>Documents</h4>
        <span className="sub">{docs.length}</span>
      </div>

      <DocumentUpload ctx={{ entity, entityId, revalidate }} />

      {docs.length ? (
        <div className="doc-list">
          {docs.map((d) => (
            <div className="doc-item" key={d.id}>
              <span className="doc-ic">{ext(d.name)}</span>
              <a className="doc-name" href={`/documents/${d.id}/download`} target="_blank" rel="noreferrer">
                {d.name}
                <small>
                  {label(d.type)} · v{d.version}
                  {" · "}
                  {new Date(d.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  {d.uploaded_by ? ` · ${d.uploaded_by}` : ""}
                </small>
              </a>
              <a className="doc-dl" href={`/documents/${d.id}/download?dl=1`}>Download</a>
              <form action={deleteDocument.bind(null, { id: d.id, storage_path: d.storage_path, revalidate })}>
                <button className="doc-del" type="submit" aria-label="Delete document">✕</button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="doc-empty">No documents yet — upload specs, surveys, contracts or marketing material here.</p>
      )}
    </div>
  );
}
