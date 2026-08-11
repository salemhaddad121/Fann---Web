// Character filters for the booking form's number fields.
//
// <input type="number"> is not the guard it looks like. Measured in the
// browser, it accepts "7e5" as a value (scientific notation — that submits
// as 700000) and "-5", while a typed "abc" silently becomes "" so the field
// just appears not to respond. None of that is wanted for a fee or a
// duration.
//
// So the inputs are type="text" with an inputMode for the mobile numeric
// keypad, and the value is filtered here on every change. Filtering rather
// than rejecting means a pasted "$1,200" degrades to "1200" instead of
// being thrown away.

/** Digits only — for whole-dollar amounts. Strips everything else. */
export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Digits with at most one decimal point — for hours, which come in halves.
 * A second point is dropped rather than truncating the rest, so "2.5.5"
 * becomes "2.55" and not "2.5"; the user sees their keystrokes land and can
 * correct them.
 */
export function decimalOnly(raw: string): string {
  const stripped = raw.replace(/[^0-9.]/g, "");
  const firstDot = stripped.indexOf(".");
  if (firstDot === -1) return stripped;
  return (
    stripped.slice(0, firstDot + 1) + stripped.slice(firstDot + 1).replace(/\./g, "")
  );
}
