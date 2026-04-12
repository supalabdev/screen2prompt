# Screen2Prompt — Architecture

## Visão Geral

Screen2Prompt é construído com **Stencil.js**, que compila para Web Components nativos e gera automaticamente wrappers para React, Vue 3 e Angular. Isso permite um único codebase que funciona em todos os frameworks suportados.

---

## Por que Stencil.js

- **Um codebase → todos os frameworks.** O Stencil gera wrappers tipados automaticamente para React, Vue e Angular. Sem adapters manuais por framework.
- **Shadow DOM nativo.** Isolamento total de CSS entre o widget e a app host — sem conflitos de estilos.
- **JSX + TypeScript.** DX familiar, sem nova sintaxe para aprender.
- **Produção comprovada.** Usado pelo Ionic Framework em escala.
- **Bundle otimizado.** Tree-shaking e lazy loading embutidos.

---

## Estrutura de Pastas

```
screen2prompt/
├── src/
│   ├── components/                    # Componentes Stencil (Web Components)
│   │   ├── s2p-widget/                # Componente raiz — entry point do widget
│   │   │   ├── s2p-widget.tsx
│   │   │   └── s2p-widget.css
│   │   ├── s2p-toolbar/               # Barra flutuante arrastável
│   │   ├── s2p-annotation-layer/      # Overlay de hover/click para anotações
│   │   ├── s2p-annotation-popup/      # Popup de feedback ao clicar elemento
│   │   ├── s2p-annotation-markers/    # Marcadores numerados sobrepostos
│   │   ├── s2p-layout-panel/          # Painel lateral com paleta de componentes
│   │   ├── s2p-wireframe-canvas/      # Canvas do Wireframe New Page mode
│   │   └── s2p-wireframe-item/        # Componente arrastável individual
│   ├── utils/                         # Lógica pura TypeScript (sem Stencil)
│   │   ├── elementCapture.ts          # Captura de CSS selector, React fiber, computed styles
│   │   ├── cssSelector.ts             # Algoritmo de CSS selector único
│   │   ├── reactFiber.ts              # Traversal do React component tree
│   │   ├── markdownGenerator.ts       # Geração do output markdown
│   │   ├── cssHints.ts                # Tradução de coordenadas para dicas CSS
│   │   ├── licenseValidator.ts        # Validação e cache de license key
│   │   └── wireframeComponents.ts     # Definições de todos os componentes de wireframe
│   ├── store/
│   │   └── widgetStore.ts             # Estado global via @stencil/store
│   └── types.ts                       # Tipos compartilhados
├── dist/
│   ├── components/                    # Web Components puros (gerado pelo Stencil)
│   ├── react/                         # Wrapper React tipado (gerado)
│   ├── vue/                           # Wrapper Vue 3 (gerado)
│   └── angular/                       # Wrapper Angular (gerado)
├── examples/
│   ├── nextjs/                        # Exemplo Next.js App Router
│   ├── vite-react/                    # Exemplo Vite + React
│   ├── nuxt/                          # Exemplo Nuxt 3
│   └── angular/                       # Exemplo Angular 17+
├── stencil.config.ts
└── package.json
```

---

## Configuração do Stencil

```typescript
// stencil.config.ts
import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'screen2prompt',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    reactOutputTarget({
      componentCorePackage: 'screen2prompt',
      proxiesFile: '../screen2prompt-react/src/components.ts',
    }),
    vueOutputTarget({
      componentCorePackage: 'screen2prompt',
      proxiesFile: '../screen2prompt-vue/src/components.ts',
    }),
    angularOutputTarget({
      componentCorePackage: 'screen2prompt',
      directivesProxyFile: '../screen2prompt-angular/src/directives/proxies.ts',
    }),
  ],
};
```

O Stencil gera automaticamente o `dist/react/`, `dist/vue/` e `dist/angular/` a cada build — sem nenhum código manual de adapter.

---

## Componente Raiz: `s2p-widget`

É o único componente que o usuário instancia diretamente. Todos os outros são montados internamente.

```tsx
// src/components/s2p-widget/s2p-widget.tsx
import { Component, Prop, State, h } from '@stencil/core';
import { validateLicense } from '../../utils/licenseValidator';

@Component({
  tag: 's2p-widget',
  styleUrl: 's2p-widget.css',
  shadow: true,   // Shadow DOM — isolamento total de CSS
})
export class S2pWidget {
  @Prop() licenseKey: string;
  @Prop() forceEnable: boolean = false; // override de produção (não recomendado)

  @State() mode: 'idle' | 'annotation' | 'layout' | 'wireframe' = 'idle';
  @State() licenseValid: boolean = false;
  @State() licenseLoading: boolean = true;

  async componentWillLoad() {
    // Desativa automaticamente em produção
    if (process.env.NODE_ENV === 'production' && !this.forceEnable) return;
    // SSR-safe: não executa no servidor
    if (typeof window === 'undefined') return;

    const status = await validateLicense(this.licenseKey);
    this.licenseValid = status.valid;
    this.licenseLoading = false;
  }

  render() {
    if (typeof window === 'undefined') return null;
    if (process.env.NODE_ENV === 'production' && !this.forceEnable) return null;

    return (
      <div class="s2p-root">
        <s2p-toolbar
          mode={this.mode}
          licenseValid={this.licenseValid}
          onModeChange={(e) => this.mode = e.detail}
        />
        {this.mode === 'annotation' && <s2p-annotation-layer />}
        {this.mode === 'layout' && <s2p-layout-panel />}
        {this.mode === 'wireframe' && <s2p-wireframe-canvas />}
        <s2p-annotation-markers />
        {!this.licenseValid && !this.licenseLoading && <s2p-license-badge />}
      </div>
    );
  }
}
```

---

## Estado Global: `@stencil/store`

O Stencil tem seu próprio store reativo leve, perfeito para compartilhar estado entre os Web Components do widget sem prop drilling.

```typescript
// src/store/widgetStore.ts
import { createStore } from '@stencil/store';
import { Annotation, Placement, Settings } from '../types';

const { state, onChange } = createStore({
  mode: 'idle' as 'idle' | 'annotation' | 'layout' | 'wireframe',
  annotations: [] as Annotation[],
  placements: [] as Placement[],
  hoveredElement: null as HTMLElement | null,
  settings: {
    outputDetail: 'standard' as 'compact' | 'standard' | 'detailed' | 'forensic',
    markerColor: '#f97316',  // laranja
    clearOnCopy: false,
  },
  viewport: {
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  },
});

export { state, onChange };
```

---

## Utils: Captura de Elementos

### `reactFiber.ts`

```typescript
const REACT_INTERNALS = ['Suspense', 'Fragment', 'StrictMode', 'Provider', 'Consumer'];

export function getReactComponentTree(element: HTMLElement): string[] {
  const fiberKey = Object.keys(element).find(
    k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  );
  if (!fiberKey) return [];

  const tree: string[] = [];
  let fiber = (element as any)[fiberKey];

  while (fiber && tree.length < 20) {
    const name = fiber.type?.displayName || fiber.type?.name;
    if (name && /^[A-Z]/.test(name) && !REACT_INTERNALS.includes(name)) {
      tree.unshift(name);
    }
    fiber = fiber.return;
  }
  return tree;
}

export function getSourceFilePath(element: HTMLElement): string | undefined {
  const fiberKey = Object.keys(element).find(k => k.startsWith('__reactFiber'));
  if (!fiberKey) return undefined;
  const debug = (element as any)[fiberKey]?._debugSource;
  return debug ? `${debug.fileName}:${debug.lineNumber}` : undefined;
}
```

### `cssSelector.ts`

```typescript
export function getUniqueCSSSelector(element: HTMLElement): string {
  // 1. Tenta ID único na página
  if (element.id) {
    const escaped = CSS.escape(element.id);
    if (document.querySelectorAll(`#${escaped}`).length === 1) return `#${escaped}`;
  }
  // 2. Tenta tag + classes descritivas
  // 3. Sobe no DOM adicionando ancestors até ser único
  // 4. Nunca usa :nth-child se houver alternativa mais legível
  // 5. Máximo de 4 níveis de profundidade
}
```

---

## Utils: Validação de Licença

```typescript
// src/utils/licenseValidator.ts
interface LicenseStatus {
  valid: boolean;
  plan?: 'solo' | 'pro' | 'team';
  expiresAt?: string;
  reason?: 'key_expired' | 'key_invalid' | 'network_error' | 'not_provided';
}

let cache: { status: LicenseStatus; timestamp: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h em ms

export async function validateLicense(key: string): Promise<LicenseStatus> {
  if (!key) return { valid: false, reason: 'not_provided' };
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) return cache.status;

  try {
    const res = await fetch('https://api.screen2prompt.com/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key }),
    });
    const status: LicenseStatus = await res.json();
    cache = { status, timestamp: Date.now() };
    return status;
  } catch {
    // Se a API estiver offline mas existe cache (mesmo expirado), usa o cache
    if (cache) return cache.status;
    return { valid: false, reason: 'network_error' };
  }
}
```

---

## Instalação por Framework

### Next.js App Router (mais comum)

```bash
npm install screen2prompt
```

```tsx
// components/DevWidget.tsx — criar este arquivo uma vez
'use client'
import dynamic from 'next/dynamic'
export const Screen2Prompt = dynamic(
  () => import('screen2prompt/react').then(m => m.S2pWidget),
  { ssr: false }
)
```

```tsx
// app/layout.tsx
import { Screen2Prompt } from '@/components/DevWidget'

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Screen2Prompt licenseKey={process.env.NEXT_PUBLIC_S2P_KEY} />
    </body></html>
  )
}
```

### Vite + React

```tsx
// src/App.tsx
import { S2pWidget } from 'screen2prompt/react'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <S2pWidget licenseKey={import.meta.env.VITE_S2P_KEY} />
    </>
  )
}
```

### Vue 3 / Nuxt 3

```vue
<!-- app.vue -->
<script setup>
import { S2pWidget } from 'screen2prompt/vue'
</script>
<template>
  <NuxtPage />
  <S2pWidget :license-key="$config.public.s2pKey" />
</template>
```

### Angular

```typescript
// app.module.ts
import { S2pWidgetModule } from 'screen2prompt/angular'
@NgModule({ imports: [S2pWidgetModule] })
export class AppModule {}
```

```html
<s2p-widget [licenseKey]="s2pKey"></s2p-widget>
```

---

## package.json — exports

```json
{
  "name": "screen2prompt",
  "files": ["dist", "loader"],
  "main": "dist/cjs/index.cjs.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs.js"
    },
    "./react": "./dist/react/index.js",
    "./vue": "./dist/vue/index.js",
    "./angular": "./dist/angular/index.js",
    "./loader": "./loader/index.js"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true }
  }
}
```

**Meta de bundle:** < 60kb gzip para o core + ~5kb por wrapper de framework.

---

## Sequência de Inicialização

```
1. Usuário adiciona <S2pWidget licenseKey="..." /> na app
2. Stencil registra o Web Component no CustomElementRegistry
3. s2p-widget.componentWillLoad():
   a. NODE_ENV === 'production' + sem forceEnable → retorna null
   b. typeof window === 'undefined' (SSR) → retorna null
   c. validateLicense(key) chamado assincronamente
4. Shadow DOM criado automaticamente pelo Stencil
5. Widget renderiza em loading state durante validação
6. Após validação: widget ativo (ou watermark se licença inválida)
7. ResizeObserver registrado para atualizar viewport no store
8. disconnectedCallback() → limpa todos os listeners e observers
```

---

## Compatibilidade

| Ambiente | Suporte | Observação |
|---|---|---|
| Next.js 13+ App Router | ✅ | Requer `dynamic({ ssr: false })` |
| Next.js Pages Router | ✅ | Direto |
| Vite + React | ✅ | Direto |
| Nuxt 3 | ✅ | Direto |
| Angular 17+ | ✅ | Direto |
| Vue 3 | ✅ | Direto |
| Chrome 90+ | ✅ | — |
| Firefox 90+ | ✅ | — |
| Safari 15+ | ✅ | — |
| Mobile | ❌ | MVP não suporta |
| SSR / Node.js | ✅ | Safe — retorna null no servidor |
