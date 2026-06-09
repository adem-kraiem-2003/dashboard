'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Traps keyboard focus inside the referenced container when `active` is true.
 * Returns focus to the `returnFocusRef` element (or document.activeElement at mount)
 * when the trap is deactivated.
 *
 * Usage:
 *   const trapRef = useFocusTrap(isOpen, triggerRef);
 *   <div ref={trapRef} role="dialog" aria-modal="true"> ... </div>
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  active: boolean,
  returnFocusRef?: { readonly current: HTMLElement | null },
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Save element that had focus before trap activated
    const previouslyFocused = (returnFocusRef?.current ?? document.activeElement) as HTMLElement | null;

    // Focus first focusable element inside container
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
    ).filter(el => !el.closest('[aria-hidden="true"]'));

    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      container.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter(el => !el.closest('[aria-hidden="true"]'));

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus on cleanup
      previouslyFocused?.focus();
    };
  }, [active, returnFocusRef]);

  return containerRef;
}
