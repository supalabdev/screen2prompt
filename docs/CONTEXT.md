# Screen2Prompt — Project Context

Este documento é o contexto principal do projeto para agentes de IA (Claude Code, Codex, OpenCode). Leia este arquivo inteiro antes de qualquer tarefa no codebase.

---

## O que é o Screen2Prompt

Screen2Prompt é um **widget npm para ambiente de desenvolvimento** que permite usuários — especialmente não-desenvolvedores — comunicar intenções visuais para agentes de IA de forma precisa e estruturada.

Em vez de escrever "muda o botão azul da sidebar", o usuário clica no botão, escreve o feedback, e o widget gera automaticamente um markdown estruturado com seletor CSS exato, hierarquia de componentes, estilos computados e o feedback — tudo que um agente precisa para agir com precisão.

### Os três modos do widget:
1. **Anotação de elementos** — clica em qualquer elemento da tela e escreve feedback
2. **Layout Mode** — arrasta wireframes sobre a página existente para indicar onde adicionar componentes
3. **Wireframe New Page** — canvas em branco para montar do zero a estrutura de uma nova tela

**O output é sempre markdown estruturado** que o usuário copia e cola no agente de IA.

---

## Por que existe

Agentes de IA dependem de contexto preciso para agir corretamente. A lacuna entre "o que o usuário quer visualmente" e "o que o agente entende" é o problema central. Screen2Prompt preenche essa lacuna com contexto estruturado e posicional, eliminando ambiguidade.

---

## Usuário final

Principalmente **não-desenvolvedores** que usam Claude Code, Codex ou OpenCode para construir seus produtos. A instalação deve ser simples ao extremo — o usuário instala um pacote npm e adiciona uma linha no layout da aplicação.

---

## Stack técnica

```
Framework do widget:  Stencil.js (Web Components)
Linguagem:            TypeScript strict
Estado:               @stencil/store
Build:                Stencil CLI (emite ESM, CJS, e wrappers por framework)
Testes:               Stencil test runner (baseado em Jest)
Lint:                 ESLint + Prettier
```

### Por que Stencil.js

O Stencil compila para Web Components nativos e **gera automaticamente wrappers** para React, Vue 3 e Angular via output targets. Isso significa um único codebase que funciona em todos os frameworks sem adapters manuais. O Shadow DOM embutido garante isolamento total de CSS com a app host.

---

## Estrutura de pastas

```
screen2prompt/
├── src/
│   ├── components/            # Web Components (Stencil)
│   │   ├── s2p-widget/        # Componente raiz — único que o usuário instancia
│   │   ├── s2p-toolbar/       # Barra flutuante com todos os controles
│   │   ├── s2p-annotation-layer/   # Overlay de captura de hover/click
│   │   ├── s2p-annotation-popup/   # Popup de escrita do feedback
│   │   ├── s2p-annotation-markers/ # Marcadores numerados na tela
│   │   ├── s2p-layout-panel/       # Painel com paleta de wireframes (Layout Mode)
│   │   ├── s2p-wireframe-canvas/   # Canvas em branco (Wireframe New Page)
│   │   └── s2p-wireframe-item/     # Componente de wireframe arrastável
│   ├── utils/                 # Lógica pura TS, sem dependência do Stencil
│   │   ├── cssSelector.ts     # Algoritmo de CSS selector único
│   │   ├── reactFiber.ts      # Traversal do React component tree via fiber
│   │   ├── markdownGenerator.ts # Geração do output markdown final
│   │   ├── cssHints.ts        # Tradução de coordenadas pixel → CSS
│   │   ├── licenseValidator.ts # Validação de license key + cache 24h
│   │   └── wireframeComponents.ts # Definições dos 65+ componentes de wireframe
│   ├── store/
│   │   └── widgetStore.ts     # Estado global via @stencil/store
│   └── types.ts               # Tipos TypeScript compartilhados
├── dist/                      # Gerado pelo build — não editar manualmente
│   ├── components/            # Web Components puros
│   ├── react/                 # Wrapper React (gerado automaticamente)
│   ├── vue/                   # Wrapper Vue 3 (gerado automaticamente)
│   └── angular/               # Wrapper Angular (gerado automaticamente)
├── examples/
│   ├── nextjs/
│   ├── vite-react/
│   ├── nuxt/
│   └── angular/
└── stencil.config.ts
```

---

## Como o widget funciona

### Fluxo de inicialização
```
<S2pWidget licenseKey="..." /> montado na app
  → Stencil registra <s2p-widget> no CustomElementRegistry
  → Shadow DOM criado automaticamente
  → validateLicense() chamado assincronamente
  → Widget renderiza (ativo ou watermark conforme licença)
  → ResizeObserver atualiza viewport no store
```

### Captura de elemento (Modo Anotação)
```
Usuário clica num elemento
  → getUniqueCSSSelector(element)        CSS selector único e legível
  → getReactComponentTree(element)       Via __reactFiber (React 18)
  → getSourceFilePath(element)           Via _debugSource do fiber
  → window.getComputedStyle(element)     Estilos filtrados e relevantes
  → Abre AnnotationPopup
  → Usuário escreve feedback → salva no store
```

### Geração do output
```
Usuário clica em "Copy"
  → markdownGenerator(state)
    → Seção "Page Feedback" com todas as anotações
    → Seção "Design Layout" se houver placements
    → Seção "Wireframe" se modo wireframe ativo
  → Copia para clipboard
```

---

## Tipos principais

```typescript
// src/types.ts

interface Annotation {
  id: number;
  type: 'element' | 'text-selection' | 'placement' | 'rearrange';
  selector: string;
  sourcePath?: string;
  componentTree?: string[];
  computedStyles?: Record<string, string>;
  feedback: string;
  position: { x: number; y: number };
  viewport: { width: number; height: number };
}

interface Placement {
  id: string;
  componentType: string;      // 'Navigation', 'Card', 'Chart Bar', etc.
  bounds: { x: number; y: number; width: number; height: number };
  alignment: 'left' | 'center' | 'right';
  isOutsideViewport: boolean;
}

interface LicenseStatus {
  valid: boolean;
  plan?: 'solo' | 'pro' | 'team';
  expiresAt?: string;
  reason?: 'key_expired' | 'key_invalid' | 'network_error' | 'not_provided';
}

interface Settings {
  outputDetail: 'compact' | 'standard' | 'detailed' | 'forensic';
  markerColor: string;
  clearOnCopy: boolean;
}
```

---

## API de licenciamento

```
POST https://api.screen2prompt.com/v1/validate
Content-Type: application/json
Body: { "licenseKey": "S2P-XXXX-XXXX-XXXX" }

Sucesso: { "valid": true, "plan": "pro", "expiresAt": "2026-12-31" }
Erro:    { "valid": false, "reason": "key_expired" }
```

A resposta é cacheada em memória por 24 horas. Se a API estiver offline e houver cache, o widget continua funcionando.

---

## Como instalar (perspectiva do usuário)

```bash
npm install screen2prompt
```

**Next.js:**
```tsx
// components/DevWidget.tsx
'use client'
import dynamic from 'next/dynamic'
export const Screen2Prompt = dynamic(
  () => import('screen2prompt/react').then(m => m.S2pWidget),
  { ssr: false }
)

// app/layout.tsx
import { Screen2Prompt } from '@/components/DevWidget'
// Adicionar dentro do <body>:
<Screen2Prompt licenseKey={process.env.NEXT_PUBLIC_S2P_KEY} />
```

**Vite + React:**
```tsx
import { S2pWidget } from 'screen2prompt/react'
<S2pWidget licenseKey={import.meta.env.VITE_S2P_KEY} />
```

---

## Regras de desenvolvimento

1. **O widget nunca deve quebrar a app host.** Todo erro interno deve ser capturado silenciosamente com `try/catch`.
2. **Zero dependências externas em runtime.** O bundle deve ser self-contained, exceto peer deps de framework.
3. **Sem efeitos colaterais persistentes.** `disconnectedCallback()` deve limpar tudo: event listeners, observers, elementos injetados no DOM.
4. **TypeScript strict.** Sem `any` explícito. Sem `@ts-ignore`.
5. **SSR-safe sempre.** Qualquer acesso a `window`, `document` ou `navigator` deve ser guardado com `typeof window !== 'undefined'`.
6. **Não mutar o DOM da app host.** O widget apenas lê o DOM da aplicação, nunca escreve nele.
7. **Performance.** Usar `requestAnimationFrame` para operações visuais frequentes (hover highlight). Cachear resultados pesados com `WeakMap`.

---

## Comandos do projeto

```bash
npm install          # instalar dependências
npm start            # build em watch mode (desenvolvimento)
npm run build        # build de produção (gera dist/ com todos os wrappers)
npm test             # rodar testes
npm run lint         # lint + typecheck
```
