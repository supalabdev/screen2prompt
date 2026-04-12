# Screen2Prompt — Product Requirements Document

**Version:** 1.0  
**Status:** Draft  
**Target release:** MVP (React)

---

## 1. Visão do Produto

Screen2Prompt é um widget npm que desenvolvedores instalam em seus projetos **durante o desenvolvimento**. Ele adiciona uma interface visual flutuante à aplicação que permite ao usuário — mesmo sem saber programar — anotar elementos, montar layouts de wireframe e descrever novas telas, gerando um output estruturado em markdown que pode ser colado diretamente em agentes de IA como Claude Code, Codex ou OpenCode.

### Frase resumo
> "Mostre ao seu agente exatamente o que você quer — sem escrever nada."

---

## 2. Problema

Pessoas que usam agentes de IA para desenvolver software (Claude Code, Codex, OpenCode) precisam comunicar mudanças visuais e de layout em linguagem natural, o que é impreciso. Frases como "muda o botão azul da sidebar" são ambíguas e o agente frequentemente age no elemento errado ou faz mudanças inesperadas.

### Dores específicas:
- Descrever posição de elementos em texto é trabalhoso e impreciso
- Usuários sem experiência em código não sabem o nome dos componentes ou seletores CSS
- Comunicar "quero uma nova tela assim" exige habilidade em design ou muita verborragia
- O feedback iterativo (ajusta aqui, move ali) é lento e frustrante

---

## 3. Solução

Screen2Prompt injeta um widget na aplicação em desenvolvimento que oferece três modos de interação:

### Modo 1 — Anotação de Elementos
O usuário clica em qualquer elemento da tela e escreve um feedback. O widget captura automaticamente o seletor CSS do elemento, o caminho do arquivo fonte (quando disponível), a hierarquia de componentes React e os estilos computados. Tudo isso é empacotado num markdown estruturado.

### Modo 2 — Layout Mode (sobre a página)
O usuário ativa o Layout Mode e arrasta componentes de wireframe (Navigation, Card, Chart, Form, etc.) sobre a página existente para indicar onde quer adicionar ou reorganizar elementos. O output inclui coordenadas, tamanho relativo ao viewport e sugestão de implementação CSS.

### Modo 3 — Wireframe New Page
A tela é substituída por um canvas em branco. O usuário monta do zero a estrutura da nova tela arrastando componentes de wireframe. Há um campo de texto para descrever o propósito da página e um slider de opacidade para referenciar a página original atrás. O output descreve a estrutura completa para o agente implementar.

---

## 4. Usuário-Alvo

**Primário:** Não-desenvolvedor usando agente de IA para construir um produto  
Exemplos: fundador solo, designer, product manager, empreendedor

**Secundário:** Desenvolvedor que quer acelerar feedback loops com agentes de IA

**Persona principal:**
- Usa Claude Code, Codex ou OpenCode para construir seu app
- Não sabe escrever CSS nem React
- Sabe o que quer visualmente mas não sabe como pedir
- Quer resultados precisos sem múltiplas tentativas

---

## 5. Modelo de Negócio

Licença por chave (license key). O usuário:
1. Compra uma licença em screen2prompt.com
2. Recebe uma `license key`
3. Passa a key como prop no componente:

```jsx
<Screen2Prompt licenseKey={process.env.NEXT_PUBLIC_S2P_KEY} />
```

4. O widget valida a key contra a API do Screen2Prompt a cada inicialização
5. Se a key for inválida ou expirada, o widget exibe um aviso discreto e desativa as funcionalidades

### Tiers planejados (futuro):
- **Solo** — 1 projeto, uso pessoal
- **Pro** — múltiplos projetos
- **Team** — múltiplos membros

---

## 6. Features — MVP (React)

### 6.1 Widget Core
- [ ] Toolbar flutuante e arrastável com ícones para cada modo
- [ ] Ativação/desativação via botão ou atalho de teclado (`Cmd+Shift+F`)
- [ ] Contador de anotações no toolbar
- [ ] Botão de copy (gera o markdown completo)
- [ ] Botão de clear (limpa todas as anotações)
- [ ] Configurações (detalhe do output, cor dos marcadores)
- [ ] Validação de license key na inicialização

### 6.2 Modo Anotação
- [ ] Hover highlight em qualquer elemento DOM
- [ ] Click para abrir popup de feedback
- [ ] Campo de texto para feedback
- [ ] Captura de CSS selector único do elemento
- [ ] Captura de React component tree (quando React disponível)
- [ ] Captura de computed styles do elemento
- [ ] Captura de source file path (via React DevTools fiber, quando disponível)
- [ ] Marcadores numerados visíveis sobre os elementos anotados
- [ ] Click no marcador para remover; right-click para editar
- [ ] Seleção de texto para anotar trechos específicos

### 6.3 Layout Mode
- [ ] Paleta de componentes de wireframe (65+ tipos)
- [ ] Drag & drop de componentes sobre a página existente
- [ ] Wireframes representados visualmente com formas abstratas
- [ ] Snap to grid
- [ ] Indicação de alinhamento (left / center / right)
- [ ] Contador de mudanças no painel
- [ ] Agrupamento de componentes por categoria na paleta:
  - **Layout:** Navigation, Header, Hero, Section, Sidebar, Footer, Modal, Banner
  - **Conteúdo:** Card, Text Block, Image, List, Quote, Divider, Badge, Avatar
  - **Dados:** Chart (Bar, Line, Pie), Table, Stats, KPI Card, Progress Bar
  - **Forms:** Input, Textarea, Button, Select, Checkbox, Radio, Toggle, File Upload

### 6.4 Wireframe New Page
- [ ] Canvas em branco com fundo pontilhado (dot grid)
- [ ] Página original some completamente (ou aparece com opacidade via slider)
- [ ] Campo de texto para descrever o propósito/contexto da página
- [ ] Mesma paleta de componentes do Layout Mode
- [ ] Drag & drop no canvas
- [ ] "Start Over" para limpar o canvas
- [ ] Output inclui apenas o wireframe (ignora anotações da página)

### 6.5 Output (Markdown)
- [ ] Seção de feedback de elementos com: número, seletor CSS, source path, feedback
- [ ] Seção de Design Layout com: reference frame, componentes com posição e tamanho, análise de rows, sugestão de implementação
- [ ] Viewport atual incluído no header
- [ ] Seção de Wireframe (quando em modo Wireframe New Page)

### 6.6 Licenciamento
- [ ] Validação de key na API (`POST /v1/validate`)
- [ ] Modo offline com cache de 24h (evita bloqueio por flakiness de rede)
- [ ] Watermark discreto em modo sem licença válida
- [ ] Componente funciona silenciosamente se key não for passada (modo dev local sem validação — a decidir)

---

## 7. Features — Fase 2 (Vue + Angular)

- [ ] Adapter Vue 3 (Composition API)
- [ ] Adapter Angular 17+ (standalone component)
- [ ] Detecção automática do framework em uso
- [ ] Output adaptado para cada framework (component tree diferente)

---

## 8. Features — Fase 3 (Futuro)

- [ ] MCP server para sync em tempo real com Claude Code (sem copy-paste)
- [ ] Webhooks para envio de anotações para serviços externos
- [ ] API pública para integrações
- [ ] Dashboard web para gerenciar licenças e ver histórico de projetos
- [ ] Extensão de browser standalone (sem npm)

---

## 9. Não é o Produto (Out of Scope MVP)

- Não salva screenshots
- Não é ferramenta de bug tracking (Jira, Linear)
- Não substitui um design tool (Figma)
- Não funciona em produção (é exclusivamente para ambiente de dev)
- Não tem colaboração em tempo real entre múltiplos usuários
- Não gera código automaticamente — apenas o prompt para o agente

---

## 10. Critérios de Sucesso — MVP

- Instalação em menos de 2 minutos em qualquer projeto React/Next.js
- Geração de output em menos de 1 segundo após copy
- Taxa de erro de licença < 0.1% (excluindo keys inválidas)
- Widget não afeta performance da aplicação host (< 50ms de overhead de carregamento)

---

## 11. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Conflito de estilos CSS com a app host | Alta | Médio | Usar Shadow DOM ou prefixo de classes único |
| React fiber API quebrar em versões futuras | Média | Médio | Fallback gracioso sem component tree |
| Usuário usar em produção acidentalmente | Média | Alto | Detectar NODE_ENV e desativar em produção por padrão |
| Concorrência (Agentation abrir licenciamento) | Média | Alto | Velocidade de execução e suporte multi-framework |
