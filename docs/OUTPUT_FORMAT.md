# Screen2Prompt — Output Format Specification

Este documento define o formato exato do markdown gerado pelo Screen2Prompt. Este é o "protocolo" entre o widget e os agentes de IA.

---

## Estrutura Geral

O output tem até 3 seções, dependendo do que foi feito:

```
## Page Feedback: {pathname}         ← sempre presente se houver anotações
**Viewport:** {width}×{height}

### {N}. {elementDescription}
...

## Design Layout                     ← presente se houver placements em Layout Mode
...

## Wireframe: {pathname}             ← presente quando em Wireframe New Page mode
...
```

As seções são independentes — o usuário pode ter apenas anotações, apenas um wireframe, ou ambos.

---

## Seção: Page Feedback

### Formato

```markdown
## Page Feedback: /dashboard
**Viewport:** 1440×900

### 1. button "Save Changes"
**Location:** .modal-footer > button.btn-primary
**Source:** src/components/SaveModal/SaveModal.tsx:87
**React Tree:** App > DashboardPage > SaveModal > Button
**Feedback:** Mudar label para "Salvar rascunho" quando não há alterações

### 2. "total de vendas"
**Location:** .stats-card:nth-child(2) > .card-label
**Source:** src/components/StatsCard/StatsCard.tsx:23
**Feedback:** Capitalizar para "Total de Vendas"

### 3. nav.main-nav
**Location:** header > nav.main-nav
**React Tree:** App > Layout > Header > MainNav
**Feedback:** Adicionar item "Relatórios" entre "Dashboard" e "Configurações"
```

### Campos por anotação

| Campo | Obrigatório | Descrição |
|---|---|---|
| `### N. {desc}` | Sim | Número sequencial + descrição do elemento (tag + texto ou tag + classe) |
| `**Location:**` | Sim | CSS selector único |
| `**Source:**` | Não | Caminho do arquivo fonte + número de linha. Omitido se não disponível |
| `**React Tree:**` | Não | Hierarquia de componentes. Omitido em modo Compact ou se não disponível |
| `**Computed Styles:**` | Não | Somente em modo Detailed/Forensic. Bloco de código CSS |
| `**Feedback:**` | Sim | Texto livre do usuário |

### Descrição do elemento (header `### N.`)

Segue esta lógica de prioridade:
1. Se é seleção de texto: `"texto selecionado"` (entre aspas)
2. Se é botão/link com texto: `button "Texto do botão"`
3. Se tem ID: `div#meu-id`
4. Se tem classe descritiva: `section.hero-banner`
5. Fallback: `tagName.classe-principal`

### Computed Styles (modo Detailed)

```markdown
### 1. div.avatar
**Location:** .profile-header > .avatar-wrapper > div.avatar
**Computed Styles:**
```css
width: 64px;
height: 64px;
border-radius: 50%;
background-color: #6366f1;
object-fit: cover;
```
**Feedback:** Aumentar para 80px e adicionar borda branca de 2px
```

---

## Seção: Design Layout

### Formato completo

```markdown
## Design Layout
> 3 components placed

### Reference Frame
- Viewport: `1440×900px`
- Content area: `720px` wide, left edge at `x=360`, right at `x=1080` (`main > .content`)
- Pixel → CSS translation:
  - **Horizontal position in container**: `element.x - 360` → use as `margin-left` or `left`
  - **Width as % of container**: `element.width / 720 × 100` → use as `width: X%`
  - **Vertical gap between elements**: `nextElement.y - (prevElement.y + prevElement.height)` → use as `margin-top` or `gap`
  - **Centered**: if `|element.centerX - 720| < 20px` → use `margin-inline: auto`

### Components
1. **Chart (Bar)** — `400×280px` at `(520, 420)`
   - Centered in content area
   - CSS: `margin-inline: auto`, `width: 400px`

2. **Stats Card** — `200×120px` at `(360, 720)`
   - Left-aligned
   - CSS: `margin-left: 0`, `width: 27.8%` (`200px`)

3. **Button Primary** — `160×44px` at `(640, 860)`
   - Centered in content area
   - CSS: `margin-inline: auto`, `width: 160px`
   - **Outside viewport** (bottom edge)

### Layout Analysis
- Row 1 (y≈420): Chart Bar
- Row 2 (y≈720): Stats Card
- Row 3 (y≈860): Button Primary

### Suggested Implementation
- Add bar chart centered in content, full-width stats row below, CTA button at bottom
```

### Reference Frame — como é calculado

1. Encontra o `main`, `article` ou `.content` mais provável como container de conteúdo
2. Calcula sua largura e posição `x` via `getBoundingClientRect()`
3. Determina o centro horizontal da página (`viewport.width / 2`)
4. Gera as fórmulas de tradução pixel → CSS

### Alinhamento

Um componente é considerado:
- **Centered**: se `Math.abs(element.centerX - viewport.width / 2) < 20`
- **Left**: se `element.x <= contentArea.x + 20`
- **Right**: se `element.x + element.width >= contentArea.right - 20`
- **Custom**: caso contrário (com valor de margin-left calculado)

---

## Seção: Wireframe (New Page Mode)

```markdown
## Wireframe: /nova-pagina
**Purpose:** Dashboard de analytics para usuários premium
**Viewport:** 1440×900

### Components
1. **Navigation** — full-width at top
   - CSS: `width: 100%`, `position: sticky`, `top: 0`

2. **Hero** — `1080×400px`, centered
   - CSS: `margin-inline: auto`, `width: 75%`

3. **Chart (Line)** — `480×300px` at left of content
   - CSS: `float: left`, `width: 44.4%`

4. **Stats Card** ×3 — `220×120px` each, row at y≈720
   - CSS: `display: flex`, `gap: 1rem`, 3 cards of `width: 30%`

5. **Footer** — full-width at bottom
   - CSS: `width: 100%`, `margin-top: auto`

### Layout Analysis
- Row 1: Navigation (sticky header)
- Row 2: Hero (centered, large)
- Row 3: Chart Line + sidebar area
- Row 4: 3× Stats Cards (flex row)
- Row 5: Footer

### Suggested Implementation
- Sticky top nav, centered hero section, two-column layout with chart on left,
  stats row below content, sticky footer
```

---

## Níveis de Detalhe (configurável pelo usuário)

| Nível | React Tree | Computed Styles | Source Path |
|---|---|---|---|
| **Compact** | ❌ | ❌ | ❌ |
| **Standard** (padrão) | ✅ Filtrado | ❌ | ✅ |
| **Detailed** | ✅ Completo | ✅ Principais props | ✅ |
| **Forensic** | ✅ Incluindo internals | ✅ Completo | ✅ |

**"Filtrado"** significa: apenas componentes definidos pelo usuário (nomes com letra maiúscula, excluindo `Fragment`, `Suspense`, `Provider`, etc.)

---

## Exemplo de output completo (combinado)

```markdown
## Page Feedback: /settings
**Viewport:** 1440×900

### 1. h1 "Configurações"
**Location:** .settings-page > header > h1
**Source:** src/pages/Settings/Settings.tsx:12
**React Tree:** App > SettingsPage > PageHeader
**Feedback:** Mudar para "Preferências" para ser mais amigável

### 2. button "Excluir conta"
**Location:** .danger-zone > button.delete-account-btn
**Source:** src/pages/Settings/DangerZone.tsx:45
**React Tree:** App > SettingsPage > DangerZone > DeleteButton
**Feedback:** Colocar o botão com estilo outlined (borda vermelha, fundo transparente)

## Design Layout
> 1 component placed

### Reference Frame
- Viewport: `1440×900px`
- Content area: `800px` wide, left edge at `x=320`, right at `x=1120` (`main`)
- Pixel → CSS translation:
  - **Centered**: if `|element.centerX - 720| < 20px` → use `margin-inline: auto`

### Components
1. **Alert** — `760×80px` at `(340, 200)`
   - Centered in content area
   - CSS: `margin-inline: auto`, `width: 760px`

### Layout Analysis
- Row 1 (y≈200): Alert

### Suggested Implementation
- Add a warning alert banner at the top of the settings page content area
```
