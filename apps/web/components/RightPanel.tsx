import { Download, GitBranch, Layers3, Pin, Sparkles } from "lucide-react";
import {
  dismissBranchAction,
  expandBranchAction,
  exportMarkdownAction,
  exportPdfAction,
  mergePinsAction,
  spinOffBranchAction,
  togglePinAction,
  updateNoteAction
} from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { BranchRecord, ExportRecord, MergedNoteRecord, NodeRecord, PinRecord, ProjectRecord } from "@/lib/store";

export function RightPanel({
  project,
  branches,
  nodes,
  pins,
  notes,
  exports
}: {
  project: ProjectRecord;
  branches: BranchRecord[];
  nodes: NodeRecord[];
  pins: PinRecord[];
  notes: MergedNoteRecord[];
  exports: ExportRecord[];
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-line bg-[#f0eee7]" aria-label="Nearby paths and saved context">
      <div className="min-h-0 flex-1 overflow-auto p-4 forks-scrollbar" data-testid="right-panel-scroll">
        <header className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nearby</p>
          <h2 className="text-lg font-semibold">Paths around this thread</h2>
        </header>
        <section data-testid="branch-panel">
          <div className="mb-3 flex items-center gap-2">
            <GitBranch size={16} />
            <h2 className="font-semibold">Suggested spin-offs</h2>
          </div>
          <div className="space-y-3">
            {branches.length === 0 ? (
              <p className="rounded border border-line bg-paper p-3 text-sm text-neutral-600">Ask a question to reveal nearby paths worth exploring.</p>
            ) : (
              branches.slice(0, 6).map((branch) => {
                const generatedNode = branch.generatedNodeId ? nodes.find((node) => node.id === branch.generatedNodeId) : undefined;
                const pinned = pins.some((pin) => pin.targetId === branch.id && pin.targetType === "BRANCH");
                return (
                  <div key={branch.id} className="rounded border border-line bg-white p-3" data-testid="branch-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rust">{branch.status.toLowerCase()}</p>
                        <h3 className="text-sm font-semibold">{branch.label}</h3>
                      </div>
                      <span className="rounded bg-skywash px-2 py-1 text-xs">{Math.round(branch.estimatedValue * 100)}%</span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-neutral-700">{branch.preview}</p>
                    {generatedNode ? <p className="mt-3 rounded bg-paper p-2 text-sm leading-5">{generatedNode.content}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={spinOffBranchAction}>
                        <input type="hidden" name="branchId" value={branch.id} />
                        <SubmitButton className="inline-flex items-center gap-1 rounded bg-moss px-2.5 py-1.5 text-xs text-white">
                          <GitBranch size={13} /> Spin off
                        </SubmitButton>
                      </form>
                      <form action={expandBranchAction}>
                        <input type="hidden" name="branchId" value={branch.id} />
                        <SubmitButton className="inline-flex items-center gap-1 rounded bg-ink px-2.5 py-1.5 text-xs text-paper">
                          <Sparkles size={13} /> Explore
                        </SubmitButton>
                      </form>
                      <form action={togglePinAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="targetId" value={branch.id} />
                        <input type="hidden" name="targetType" value="BRANCH" />
                        <input type="hidden" name="label" value={branch.label} />
                        <SubmitButton className={`inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs ${pinned ? "border-moss bg-skywash" : "border-line bg-paper"}`}>
                          <Pin size={13} /> {pinned ? "Saved" : "Save"}
                        </SubmitButton>
                      </form>
                      <form action={dismissBranchAction}>
                        <input type="hidden" name="branchId" value={branch.id} />
                        <SubmitButton className="rounded border border-line bg-paper px-2.5 py-1.5 text-xs text-neutral-600">
                          Dismiss
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-6" data-testid="memory-panel">
          <div className="mb-3 flex items-center gap-2">
            <Pin size={16} />
            <h2 className="font-semibold">Saved context</h2>
          </div>
          <div className="space-y-2">
            {pins.length === 0 ? (
              <p className="rounded border border-line bg-paper p-3 text-sm text-neutral-600">Saved answers and spin-offs will collect here.</p>
            ) : (
              pins.map((pin) => (
                <div key={pin.id} className="rounded border border-line bg-white px-3 py-2">
                  <p className="text-sm font-medium">{pin.label}</p>
                  <p className="text-xs text-neutral-500">{pin.targetType.toLowerCase()}</p>
                </div>
              ))
            )}
          </div>
          <form action={mergePinsAction} className="mt-3">
            <input type="hidden" name="projectId" value={project.id} />
            <SubmitButton className="inline-flex w-full items-center justify-center gap-2 rounded bg-moss px-3 py-2 text-sm text-white">
              <Layers3 size={15} /> Synthesize saved context
            </SubmitButton>
          </form>
        </section>

        <section className="mt-6" data-testid="notes-panel">
          <h2 className="mb-3 font-semibold">Synthesis notes</h2>
          {notes.length === 0 ? (
            <p className="rounded border border-line bg-paper p-3 text-sm text-neutral-600">Merged notes will appear here and can be edited.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="rounded border border-line bg-white p-3">
                  <h3 className="text-sm font-semibold">{note.title}</h3>
                  <form action={updateNoteAction} className="mt-2">
                    <input type="hidden" name="noteId" value={note.id} />
                    <textarea name="content" defaultValue={note.content} className="h-40 w-full resize-none rounded border border-line bg-paper p-2 text-xs leading-5" />
                    <div className="mt-2 flex gap-2">
                      <SubmitButton className="rounded bg-ink px-2.5 py-1.5 text-xs text-paper">Save</SubmitButton>
                    </div>
                  </form>
                  <form action={exportMarkdownAction} className="mt-2">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="noteId" value={note.id} />
                    <SubmitButton className="inline-flex items-center gap-1 rounded border border-line bg-paper px-2.5 py-1.5 text-xs">
                      <Download size={13} /> Export Markdown
                    </SubmitButton>
                  </form>
                  <form action={exportPdfAction} className="mt-2">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="noteId" value={note.id} />
                    <SubmitButton className="inline-flex items-center gap-1 rounded border border-line bg-paper px-2.5 py-1.5 text-xs">
                      <Download size={13} /> Export PDF
                    </SubmitButton>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6" data-testid="exports-panel">
          <h2 className="mb-3 font-semibold">Exports</h2>
          {exports.length === 0 ? (
            <p className="rounded border border-line bg-paper p-3 text-sm text-neutral-600">Markdown exports will be recorded here.</p>
          ) : (
            <div className="space-y-2">
              {exports.map((item) => (
                <details key={item.id} className="rounded border border-line bg-white p-3">
                  <summary className="cursor-pointer text-sm font-semibold">{item.title}</summary>
                  {item.type === "MARKDOWN" ? (
                    <pre className="mt-2 whitespace-pre-wrap rounded bg-paper p-2 text-xs">{item.content}</pre>
                  ) : (
                    <p className="mt-2 rounded bg-paper p-2 text-xs text-neutral-600">
                      PDF artifact recorded. Binary content is hidden from the workspace preview.
                    </p>
                  )}
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
