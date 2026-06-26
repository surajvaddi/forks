export type ForksEvent =
  | "chat.prompt_submitted"
  | "chat.answer_generated"
  | "branch.generated"
  | "pin.toggled"
  | "note.merged"
  | "export.created";

export function logForksEvent(event: ForksEvent, metadata: Record<string, string | number | boolean | undefined>) {
  if (process.env.NODE_ENV === "test") return;
  console.info(JSON.stringify({ event, ...metadata, timestamp: new Date().toISOString() }));
}
