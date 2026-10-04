"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Moves focus to the first invalid control AFTER React has rendered the
 * errors. (A requestAnimationFrame can fire before the commit, and is paused
 * entirely in background tabs.) Radio groups mark their <fieldset> invalid;
 * focus goes to the group's checked or first option instead, since a fieldset
 * itself can't take focus.
 */
export function useFocusFirstError(root: RefObject<HTMLElement | null>) {
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (!request) return;
    const invalid = root.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    if (!invalid) return;
    const target =
      invalid.tagName === "FIELDSET"
        ? (invalid.querySelector<HTMLElement>("input:checked") ??
          invalid.querySelector<HTMLElement>("input"))
        : invalid;
    target?.focus();
  }, [request, root]);

  return useCallback(() => setRequest((n) => n + 1), []);
}
