'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface MousePosition {
  x: number; // -1..1
  y: number; // -1..1
}

const CENTER: MousePosition = { x: 0, y: 0 };

/**
 * Normalized mouse position (-1..1 on both axes), relative to `targetRef`
 * if given, otherwise the viewport. Powers mouse-responsive hero lighting
 * and tilt effects. rAF-throttled so it doesn't fire a re-render per
 * mousemove event.
 */
export function useMousePosition<T extends HTMLElement>(targetRef?: RefObject<T | null>): MousePosition {
  const [position, setPosition] = useState<MousePosition>(CENTER);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    function handleMove(event: MouseEvent) {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const rect = targetRef?.current?.getBoundingClientRect();
        if (rect) {
          setPosition({
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
          });
        } else {
          setPosition({
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: (event.clientY / window.innerHeight) * 2 - 1,
          });
        }
      });
    }

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [targetRef]);

  return position;
}
