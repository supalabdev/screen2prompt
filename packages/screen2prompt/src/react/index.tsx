'use client';
import { createElement, useEffect, useRef } from 'react';
import { defineCustomElements } from 'screen2prompt/loader';

if (typeof window !== 'undefined') {
  defineCustomElements();
}

export interface Screen2PromptProps {
  dontShowInProd?: boolean;
}

export function Screen2Prompt({ dontShowInProd = false }: Screen2PromptProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    (ref.current as any).dontShowInProd = dontShowInProd;
  }, [dontShowInProd]);

  return createElement('s2p-widget', { ref });
}
