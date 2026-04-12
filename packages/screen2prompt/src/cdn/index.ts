import { defineCustomElement } from '../../dist/components/s2p-widget.js';

(function () {
  if (typeof window === 'undefined') return;

  defineCustomElement(); // cascateia todos os 8 componentes

  const script =
    (document.currentScript as HTMLScriptElement | null) ??
    document.querySelector('script[src*="screen2prompt"]');

  const dontShowInProd = 'dontShowInProd' in (script?.dataset ?? {});

  const mount = () => {
    if (document.querySelector('s2p-widget')) return; // idempotente
    const widget = document.createElement('s2p-widget') as HTMLElement & {
      dontShowInProd: boolean;
    };
    widget.dontShowInProd = dontShowInProd;
    document.body.appendChild(widget);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
