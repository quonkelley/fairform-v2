import fs from "node:fs";
import path from "node:path";

const DOCS_DIR = path.join(process.cwd(), "docs");

export default function DocsPage() {
  const entries = fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Documentation
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          FairForm knowledge base
        </h1>
        <p className="text-base text-muted-foreground">
          These living documents anchor product, design, and engineering
          decisions for the MVP. Updates cascade into Cursor and task planning.
        </p>
      </header>

      <section className="space-y-3">
        {entries.map((file) => (
          <article
            className="rounded-xl border border-border bg-card p-4 shadow-card"
            key={file}
          >
            <p className="text-lg font-semibold text-primary">
              {file.replace(/\.md$/, "")}
            </p>
            <p className="text-sm text-muted-foreground">
              Stored at <code className="font-mono text-xs">{`docs/${file}`}</code>. Open
              directly in your editor for the full spec.
            </p>
          </article>
        ))}
      </section>

      <p className="text-sm text-muted-foreground">
        Missing a doc? Add it to the <code className="font-mono">/docs</code>{" "}
        directory and this list will update automatically in development.
      </p>
    </div>
  );
}
