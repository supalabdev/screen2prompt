# Screen2Prompt — Roadmap

## Fase 1 — MVP React (Target: 6 semanas)

### Semana 1-2: Fundação
- [ ] Setup do repositório (Vite lib mode, TypeScript strict, ESLint, Prettier, Vitest)
- [ ] Estrutura de pastas conforme ARCHITECTURE.md
- [ ] Shadow DOM container + React root dentro do shadow
- [ ] Toolbar flutuante arrastável (apenas UI, sem funcionalidade)
- [ ] Store reativo simples
- [ ] Validação de licença (endpoint + cache em memória)

### Semana 3: Modo Anotação
- [ ] AnnotationLayer com hover highlight
- [ ] Click para abrir AnnotationPopup
- [ ] Captura de CSS selector único
- [ ] Captura de React component tree via fiber
- [ ] Captura de computed styles
- [ ] Marcadores numerados sobre elementos anotados
- [ ] Edição e remoção de anotações
- [ ] Seleção de texto para anotar trechos

### Semana 4: Geração de Output
- [ ] markdownGenerator completo
- [ ] cssHints (tradução de coordenadas para CSS)
- [ ] Botão Copy funcional
- [ ] Botão Clear
- [ ] Viewport capturado corretamente
- [ ] Testes do gerador de markdown

### Semana 5: Layout Mode + Wireframe Components
- [ ] Paleta de componentes (todas as categorias)
- [ ] Drag & drop sobre a página
- [ ] Preview visual de cada componente (SVG abstrato)
- [ ] Snap to grid
- [ ] Detecção de alinhamento
- [ ] Output do Layout Mode integrado ao markdown

### Semana 6: Wireframe New Page + Polimento
- [ ] Canvas em branco com dot grid
- [ ] Slider de opacidade
- [ ] Campo de descrição da página
- [ ] Output exclusivo do wireframe
- [ ] Atalhos de teclado
- [ ] SSR-safe (Next.js App Router testado)
- [ ] Exemplo funcional com Next.js
- [ ] Exemplo funcional com Vite + React
- [ ] README.md completo
- [ ] Build de produção < 50kb gzip

---

## Fase 2 — Vue 3 (Target: 3 semanas após MVP)

- [ ] Adapter Vue 3 (Composition API + `defineComponent`)
- [ ] Captura de component tree via Vue DevTools hook (`__vue_app__`)
- [ ] Testes com Vite + Vue
- [ ] Exemplo funcional Nuxt.js

---

## Fase 3 — Angular (Target: 3 semanas após Vue)

- [ ] Adapter Angular 17+ (standalone component)
- [ ] Captura de component tree via Angular DevTools
- [ ] Testes com Angular CLI
- [ ] Exemplo funcional Angular standalone

---

## Fase 4 — MCP + Webhooks (Future)

- [ ] MCP server npm package (`screen2prompt-mcp`)
- [ ] Sync em tempo real entre widget e Claude Code (sem copy-paste)
- [ ] Webhook para envio de anotações para serviços externos (Linear, Jira, Notion)
- [ ] API pública documentada

---

## Fase 5 — Platform (Future)

- [ ] Dashboard web (gerenciar licenças, projetos, histórico)
- [ ] Extensão de browser (sem npm install)
- [ ] CLI para scaffolding (`npx screen2prompt init`)

---

## Decisões Técnicas Pendentes

| Decisão | Opções | Status |
|---|---|---|
| Isolamento de estilos | Shadow DOM vs. prefixo de classes | Shadow DOM (decidido) |
| Drag & drop | API nativa vs. @dnd-kit | API nativa (decidido — zero deps) |
| Bundle de ícones | SVG inline vs. icon library | SVG inline (decidido) |
| State management | Custom store vs. Zustand | Custom store (decidido — zero deps) |
| Validação offline | Cache em memória vs. localStorage | Memória (decidido — sem persistência) |
| Modo sem licença | Desativar tudo vs. watermark | Watermark + funcional limitado (a decidir) |
