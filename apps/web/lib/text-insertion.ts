export type TextInsertionResult = {
  value: string;
  caretOffset: number;
};

function needsSpaceBetween(left: string, right: string) {
  return Boolean(left && right && !/\s$/.test(left) && !/^\s/.test(right));
}

export function insertTextAtCaret(currentValue: string, insertText: string, selectionStart: number, selectionEnd = selectionStart): TextInsertionResult {
  const start = Math.max(0, Math.min(selectionStart, currentValue.length));
  const end = Math.max(start, Math.min(selectionEnd, currentValue.length));
  const before = currentValue.slice(0, start);
  const after = currentValue.slice(end);
  const chunk = insertText.trim();

  if (!chunk) {
    return { value: currentValue, caretOffset: start };
  }

  const prefix = needsSpaceBetween(before, chunk) ? " " : "";
  const suffix = needsSpaceBetween(chunk, after) ? " " : "";
  const inserted = `${prefix}${chunk}${suffix}`;

  return {
    value: `${before}${inserted}${after}`,
    caretOffset: before.length + prefix.length + chunk.length
  };
}
