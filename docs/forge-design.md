# Forge — Design System

Sistema de gestión de entrenamiento para miembros y entrenadores.  
Mobile dark (miembro) · Desktop light (entrenador / admin)

---

## Índice

1. [Principios](#1-principios)
2. [Colores](#2-colores)
3. [Tipografía](#3-tipografía)
4. [Espaciado](#4-espaciado)
5. [Tokens de Componentes](#5-tokens-de-componentes)
6. [Componentes](#6-componentes)
7. [Iconografía](#7-iconografía)
8. [Temas](#8-temas)
9. [Grids y Layout](#9-grids-y-layout)
10. [Movimiento y Animación](#10-movimiento-y-animación)
11. [Pantallas](#11-pantallas)
12. [Reglas de Consistencia](#12-reglas-de-consistencia)

---

## 1. Principios

### P-01 · Data First
Los números son los protagonistas de la interfaz. Todo dato de rendimiento (kg, reps, series, tiempo) usa DM Mono y ocupa el mayor tamaño tipográfico dentro de su contexto. La jerarquía visual siempre prioriza el número sobre su label.

### P-02 · Touch Generous
En mobile, el mínimo de tap target es **44 × 44px** sin excepción. Los controles de registro de sets deben ser operables con una mano y con guantes de gym. Nunca comprimir interacciones críticas por diseño.

### P-03 · Context Aware
Mobile es dark, inmersivo y rápido — diseñado para el gym con luz variable. Desktop es light, denso en información y analítico — diseñado para la oficina o el studio del entrenador. Misma marca, experiencias optimizadas para cada contexto.

### P-04 · Progress Visible
Todo avance del usuario debe ser visible de forma inmediata. Barras de progreso, badges de PR, streaks y comparativas vs sesión anterior son elementos de primera clase. El usuario debe sentir que está mejorando en cada interacción.

### P-05 · Coach Clarity
El entrenador necesita ver la información de todos sus clientes a la vez. El dashboard desktop es denso pero organizado. Los datos críticos (adherencia, última sesión, alertas de inactividad) nunca requieren scroll para ser visibles.

### P-06 · AI as Guide
El contenido generado por IA siempre se identifica visualmente con Pulse Blue. El tono del feedback de IA es de coach, no de robot — específico, accionable y motivador. La IA nunca interrumpe el flujo activo de entrenamiento.

---

## 2. Colores

### Paleta Principal

| Token | Hex | Uso |
|---|---|---|
| `--color-orange` | `#E05C2A` | CTAs primarios, acciones de registro, highlights críticos |
| `--color-iron` | `#0A0A0E` | Fondo mobile |
| `--color-carbon` | `#14141E` | Surface dark, cards en mobile |
| `--color-brass` | `#C8A96E` | PRs, logros, elementos premium |
| `--color-chalk` | `#F5F0E8` | Texto principal sobre dark |
| `--color-offwhite` | `#FAFAF7` | Fondo desktop |
| `--color-green` | `#2ECC8C` | Éxito, progreso, completado |
| `--color-red` | `#E84C6A` | Errores, alertas, cancelar |
| `--color-blue` | `#6B7AFF` | IA, información, links |

### Paleta de Apoyo

| Token | Hex | Uso |
|---|---|---|
| `--color-gray-dark` | `#1E1E28` | Borders en dark theme |
| `--color-gray-mid` | `#3A3A48` | Separadores, dividers |
| `--color-gray-muted` | `#8A8898` | Texto secundario, placeholders |
| `--color-surface-light` | `#F2F0EB` | Filas alternas en tablas desktop |

### Reglas de Uso

> **Orange** es exclusivo para CTAs primarios y acciones de registro. Nunca decorativo.  
> **Brass** es exclusivo para PRs y logros. Su escasez le da valor.  
> **Blue** identifica todo contenido generado por IA. Siempre distinguible.  
> **Green** confirma acciones completadas y progreso positivo.  
> **Red** comunica error, alerta o acción destructiva.

### Opacidades de Superficie

```
Overlay dark:   rgba(10, 10, 14, 0.85)
Card dark:      rgba(20, 20, 30, 1.0)      → #14141E
Stroke dark:    rgba(255, 255, 255, 0.06)  → #FFFFFF0F
Stroke light:   rgba(0, 0, 0, 0.10)        → #0000001A
AI card bg:     rgba(107, 122, 255, 0.08)
```

---

## 3. Tipografía

### Familias

| Familia | Rol | Pesos usados |
|---|---|---|
| **Syne** | Display, títulos de pantalla | 800 ExtraBold |
| **Figtree** | UI, body, labels, botones | 400 Regular · 500 Medium · 600 SemiBold |
| **DM Mono** | Datos numéricos de rendimiento | 400 Regular · 500 Medium |

### Escala de Tamaños

| Nombre | Familia | Peso | Tamaño | Interlineado | Uso |
|---|---|---|---|---|---|
| `display` | Syne | 800 | 48px | 1.0 | Wordmark, hero |
| `h1` | Syne | 800 | 32px | 1.1 | Títulos de pantalla |
| `h2` | Syne | 800 | 24px | 1.2 | Subtítulos de sección |
| `h3` | Figtree | 600 | 18px | 1.3 | Encabezados de card |
| `body-lg` | Figtree | 400 | 16px | 1.6 | Texto corrido |
| `body` | Figtree | 400 | 14px | 1.6 | Texto secundario |
| `label` | Figtree | 500 | 13px | 1.4 | Labels de input, nav |
| `caption` | Figtree | 400 | 11px | 1.4 | Hints, timestamps |
| `tag` | DM Mono | 500 | 10px | 1.0 | Chips, categorías |
| `data-xl` | DM Mono | 500 | 32px | 1.0 | Métricas hero |
| `data-lg` | DM Mono | 500 | 24px | 1.0 | Métricas de card |
| `data-md` | DM Mono | 500 | 18px | 1.0 | Valores en tabla |
| `data-sm` | DM Mono | 400 | 14px | 1.0 | Datos inline |

### Regla de Oro

> Si es un número de rendimiento → **DM Mono**  
> Si es texto de interfaz → **Figtree**  
> Si es un título grande de pantalla → **Syne**

### Letter Spacing

```
Syne h1:        letter-spacing: -0.02em
DM Mono tags:   letter-spacing: 0.08em (uppercase)
DM Mono datos:  letter-spacing: -0.01em
Figtree labels: letter-spacing: 0.01em
```

---

## 4. Espaciado

Escala base de 4px. Todos los valores son múltiplos de 4.

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4px | Gaps internos mínimos |
| `--space-2` | 8px | Gap icon + label, padding badge |
| `--space-3` | 12px | Padding interno de cards pequeñas |
| `--space-4` | 16px | Padding estándar de componentes |
| `--space-6` | 24px | Separación entre secciones |
| `--space-8` | 32px | Márgenes de pantalla desktop |
| `--space-5` | 20px | Márgenes de pantalla mobile |

### Padding de Pantalla

```
Mobile:   20px horizontal
Desktop:  32px horizontal · 24px vertical
```

---

## 5. Tokens de Componentes

### Bordes y Radios

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 6px | Tags, badges, pills pequeños |
| `--radius-md` | 10px | Botones, inputs |
| `--radius-lg` | 16px | Cards, modals, bottom sheets |
| `--radius-xl` | 24px | Cards hero, frames de pantalla |
| `--radius-full` | 999px | Pills, avatares, toggle |

### Bordes

```
Dark cards:    1px solid rgba(255, 255, 255, 0.06)
Light cards:   1px solid rgba(0, 0, 0, 0.10)
Input focus:   1.5px solid #E05C2A
Input error:   1.5px solid #E84C6A
AI card:       2px solid rgba(107, 122, 255, 0.3) (borde izquierdo)
PR card:       2px solid #C8A96E (borde izquierdo)
```

### Sombras

```
Card light:    0 2px 12px rgba(0, 0, 0, 0.06)
Card hover:    0 4px 20px rgba(0, 0, 0, 0.10)
Button active: 0 0 0 3px rgba(224, 92, 42, 0.25)
```

### Tamaños de Interacción

| Token | Valor | Uso |
|---|---|---|
| `--tap-min` | 44px | Tap target mínimo mobile |
| `--input-height` | 48px | Altura de inputs mobile |
| `--btn-height-lg` | 52px | Botones CTA primario mobile |
| `--btn-height-md` | 44px | Botones secundarios |
| `--btn-height-sm` | 36px | Botones en cards desktop |
| `--nav-bottom-height` | 72px | Bottom navigation mobile |
| `--sidebar-width` | 220px | Sidebar desktop |

---

## 6. Componentes

### Button

#### Button/Primary
```
Fondo:        #E05C2A
Texto:        #FFFFFF · Figtree 600 · 15px
Altura:       52px (mobile) · 44px (desktop)
Radio:        10px
Padding:      0 24px
Estado hover: opacity 0.9
Estado press: scale 0.97 · opacity 0.85
Estado disabled: opacity 0.35
```

#### Button/Secondary
```
Fondo:        transparent
Borde:        1.5px solid #E05C2A
Texto:        #E05C2A · Figtree 600 · 15px
Altura:       52px (mobile) · 44px (desktop)
Radio:        10px
Estado hover: background rgba(224, 92, 42, 0.08)
```

#### Button/Ghost
```
Fondo:        transparent
Texto:        #8A8898 · Figtree 500 · 14px
Sin borde
Uso:          Acciones secundarias, cancelar
```

### Input

#### Input/Text
```
Label:        Figtree 500 · 13px · --color-gray-muted
              Margen inferior: 6px
Campo:        Fondo #14141E (dark) / #FFFFFF (light)
              Borde: 1px solid rgba(255,255,255,0.06)
              Radio: 10px · Altura: 48px · Padding: 0 16px
Placeholder:  Figtree 400 · 15px · opacity 0.4
Valor:        Figtree 400 · 15px · --color-chalk
Focus:        Borde 1.5px solid #E05C2A
Error:        Borde 1.5px solid #E84C6A
Helper text:  Figtree 400 · 11px · debajo del campo · 4px margen
```

#### Input/Number (kg, reps)
```
Campo:        Fondo #1A1A28 · Radio 10px
              Altura: 56px · Ancho: flexible
Valor:        DM Mono 500 · 22px · --color-chalk · centrado
Label:        Figtree 500 · 10px · uppercase · --color-gray-muted
              Posición: encima del valor
Focus:        Borde 1.5px solid #E05C2A · fondo #1E1E38
Nota:         Más grande que Input/Text — el usuario lo lee
              a distancia en el gym
```

### Badge

```
Texto:        DM Mono 500 · 10px · uppercase · letter-spacing 0.08em
Padding:      3px 8px
Radio:        999px (pill)

Variantes:
  success:    bg rgba(46,204,140,0.15) · text #2ECC8C
  warning:    bg rgba(200,169,110,0.15) · text #C8A96E
  error:      bg rgba(232,76,106,0.15) · text #E84C6A
  info:       bg rgba(107,122,255,0.15) · text #6B7AFF
  pr:         bg rgba(200,169,110,0.20) · text #C8A96E · borde 1px solid #C8A96E44
```

### Card/Exercise (pantalla 2.2 y 2.5)

```
Fondo:        #14141E
Borde:        1px solid rgba(255,255,255,0.06)
Radio:        16px
Padding:      16px

Header:
  Nombre:     Figtree 600 · 15px · --color-chalk
  Series obj: DM Mono 400 · 12px · --color-gray-muted · "3 × 12"

Filas de set:
  Altura:     44px mínimo
  Set #:      DM Mono 500 · 14px · --color-gray-muted
  Reps:       DM Mono 500 · 16px · --color-chalk
  Kg:         DM Mono 500 · 16px · --color-chalk
  Check:      Círculo outline 22px → relleno verde al completar
  
  Fila activa:
    Fondo:    rgba(224, 92, 42, 0.12)
    Borde-L:  2px solid #E05C2A
    Texto:    sin cambio de color (siempre chalk)

Botón + Serie:
  Texto:      Figtree 500 · 13px · #E05C2A
  Padding:    10px 0
  Alineación: centrado
```

### Card/Session (pantalla 2.4)

```
Fondo:        #14141E
Borde:        1px solid rgba(255,255,255,0.06)
Radio:        16px
Padding:      16px

Título:       Figtree 600 · 16px · --color-chalk
Fecha:        Figtree 400 · 12px · --color-gray-muted
Métricas:     DM Mono 500 · 13px · --color-chalk
              Formato: "5,000kg  ·  15 series  ·  55 min"
Badge PR:     Componente Badge variante pr · alineado a la derecha del título

Borde PR:     Si hay PR → borde izquierdo 2px solid #C8A96E
```

### Card/AI Feedback

```
Fondo:        rgba(107, 122, 255, 0.06)
Borde:        1px solid rgba(107, 122, 255, 0.20)
Borde-L:      2px solid #6B7AFF
Radio:        16px
Padding:      16px

Label:        DM Mono 500 · 10px · uppercase · #6B7AFF
              "ANÁLISIS IA" o "NOTA DEL COACH"
              Margen inferior: 8px
Texto:        Figtree 400 · 14px · --color-chalk · line-height 1.6
```

### Card/Metric

```
Fondo:        #14141E (dark) / #F2F0EB (light)
Radio:        12px
Padding:      14px 16px

Label:        Figtree 500 · 11px · uppercase · --color-gray-muted
              Posición: encima del valor
Valor:        DM Mono 500 · 28px · --color-chalk (dark) / --color-iron (light)
Delta:        Figtree 400 · 11px
              Positivo: #2ECC8C con ▲
              Negativo: #E84C6A con ▼
```

### Navigation/Bottom (mobile)

```
Altura:       72px
Fondo:        #0A0A0E con blur backdrop
Borde-T:      1px solid rgba(255,255,255,0.06)
Padding-B:    safe-area-inset-bottom (para notch)

Items: 4 máximo
  Home · Entrenar (+) · Progreso · Perfil

Item inactivo:
  Icono:      22px · #3A3A48
  Label:      Figtree 500 · 10px · #3A3A48

Item activo:
  Icono:      22px · #E05C2A
  Label:      Figtree 600 · 10px · #E05C2A

Botón central (+):
  Fondo:      #E05C2A
  Tamaño:     52px · Radio: 999px
  Elevado:    -12px desde la base del nav
  Sombra:     0 4px 16px rgba(224, 92, 42, 0.40)
  Icono:      24px · #FFFFFF
```

### Navigation/Sidebar (desktop)

```
Ancho:        220px
Fondo:        #0A0A0E
Padding:      24px 16px

Wordmark:
  "FORGE." → Syne 800 · 18px · chalk + punto orange
  Margen inferior: 32px

Items de navegación:
  Inactivo:   Figtree 500 · 14px · #8A8898
              Padding: 10px 12px · Radio: 8px
  Activo:     Figtree 600 · 14px · #FFFFFF
              Fondo: rgba(255,255,255,0.08)
              Borde-L: 2px solid #E05C2A
  Icono:      18px · alineado con texto

Perfil del usuario (bottom):
  Avatar:     36px · Radio: 999px
  Nombre:     Figtree 500 · 13px · chalk
  Rol:        Figtree 400 · 11px · muted
```

### Tab Switcher

```
Fondo contenedor: rgba(255,255,255,0.04) (dark) / #F2F0EB (light)
Radio:            10px
Padding:          4px

Tab inactivo:
  Texto:     Figtree 500 · 13px · --color-gray-muted
  Fondo:     transparent
  Padding:   8px 16px

Tab activo:
  Texto:     Figtree 600 · 13px · --color-chalk (dark) / --color-iron (light)
  Fondo:     #14141E (dark) / #FFFFFF (light)
  Radio:     8px
  Sombra:    0 1px 4px rgba(0,0,0,0.15)
```

### Streak / Days Row

```
Círculo día:   28px · Radio: 999px
Completado:    Fondo #E05C2A · texto #FFFFFF · Figtree 700 · 11px
Pendiente:     Fondo transparent · Borde 1px solid #3A3A48 · texto #3A3A48
Hoy:           Borde 1.5px solid #E05C2A · texto #E05C2A
Gap entre:     6px
Label "Tu racha": Figtree 500 · 11px · --color-gray-muted · alineado a la derecha
```

---

## 7. Iconografía

**Librería:** Phosphor Icons  
**Estilo:** Regular (outline) por defecto · Fill para estado activo  
**Tamaños:**

| Contexto | Tamaño |
|---|---|
| Bottom navigation | 22px |
| Cards y listas | 18px |
| Inline con texto | 16px |
| Botones | 18px |
| Decorativos / hero | 24px |

**Color:** Hereda del texto de su contexto. Nunca un color propio salvo acento intencional.

**Iconos de sistema Forge:**

| Ícono | Phosphor | Contexto |
|---|---|---|
| Home | `House` | Nav bottom |
| Iniciar entreno | `Plus` | Nav bottom central |
| Progreso | `ChartLineUp` | Nav bottom |
| Perfil | `User` | Nav bottom |
| Configuración | `Gear` | Header derecho |
| Timer | `Timer` | Pantalla de registro |
| PR / Trofeo | `Trophy` | Badge de récord |
| Coach | `Barbell` | Rutina asignada |
| IA | `Sparkle` | Feedback de IA |
| Completado | `CheckCircle` | Set completado |
| Añadir | `PlusCircle` | Agregar serie |

---

## 8. Temas

### Dark Theme (Mobile · Miembro)

```yaml
background:       #0A0A0E
surface:          #14141E
surface-raised:   #1A1A28
border:           rgba(255, 255, 255, 0.06)
border-emphasis:  rgba(255, 255, 255, 0.12)

text-primary:     #F5F0E8
text-secondary:   #8A8898
text-disabled:    rgba(245, 240, 232, 0.30)

accent:           #E05C2A
accent-muted:     rgba(224, 92, 42, 0.12)
```

### Light Theme (Desktop · Entrenador / Admin)

```yaml
background:       #FAFAF7
surface:          #FFFFFF
surface-alt:      #F2F0EB
border:           rgba(0, 0, 0, 0.10)
border-emphasis:  rgba(0, 0, 0, 0.18)

text-primary:     #0A0A0E
text-secondary:   #6A6560
text-disabled:    rgba(10, 10, 14, 0.30)

accent:           #E05C2A
accent-muted:     rgba(224, 92, 42, 0.08)
```

---

## 9. Grids y Layout

### Mobile (390px · iPhone 14)

```
Columnas:     1
Margen:       20px
Gutter:       —
Frame Figma:  390 × 844px
```

### Desktop (1440px)

```
Columnas:     12
Margen:       32px
Gutter:       24px
Frame Figma:  1440 × 900px

Layout base:
  Sidebar:    220px (fijo)
  Contenido:  1440 - 220 - 32 - 32 = 1156px
  Header:     64px (fijo, sticky)
```

### Breakpoints

```
Mobile:       < 768px
Tablet:       768px – 1024px
Desktop:      > 1024px
Wide:         > 1440px
```

---

## 10. Movimiento y Animación

### Principio
Las animaciones comunican estado, no decoran. Cada animación tiene un propósito específico.

### Duraciones

| Token | Valor | Uso |
|---|---|---|
| `--duration-micro` | 100ms | Hover states, toggle |
| `--duration-fast` | 150ms | Botones, checkboxes |
| `--duration-normal` | 280ms | Transiciones de pantalla, modals |
| `--duration-slow` | 400ms | Celebraciones, onboarding |

### Easings

```
--ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1)   → entrada de elementos
--ease-in:      cubic-bezier(0.4, 0.0, 1, 1)      → salida de elementos
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) → botones, checkboxes
```

### Interacciones Clave

```
Button press:     scale(0.97) · 150ms ease-out
Checkbox complete: scale(1.2) → scale(1.0) · 200ms ease-spring + color verde
Screen enter:     translateY(8px) → translateY(0) + opacity 0 → 1 · 280ms ease-out
PR badge appear:  scale(0) → scale(1.1) → scale(1.0) · 400ms ease-spring
Tab switch:       pill desliza bajo el tab activo · 200ms ease-out
```

---

## 11. Pantallas

### Flujo 1 — Login

**1.1 Login** `mobile · 390×844`

```
Layout:       Full-screen dark. Centrado vertical.
Elementos:
  - Wordmark FORGE. centrado · Syne 800 · 48px
  - Tagline: "TRAINING MANAGEMENT" · DM Mono · 11px · muted · uppercase
  - Input/Text email
  - Input/Text password (con toggle de visibilidad)
  - Button/Primary "INGRESAR" full-width
  - Link ghost "¿Olvidaste tu contraseña?"
Fondo:        #0A0A0E con pattern diagonal lines opacity 0.02
```

---

### Flujo 2 — Miembro (Mobile)

**2.1 Home Dashboard** `mobile · 390×844`

```
Header:
  - "Hola, [Nombre]" · Syne 800 · 28px
  - Gear icon · settings
  
Streak row:
  - Label "Tu racha" · muted derecha
  - 7 círculos de días con estado
  
Metric cards (2 columnas):
  - Card/Metric: Último peso
  - Card/Metric: Volumen semana
  
Card rutina del día:
  - Fondo: #E05C2A
  - Título: Figtree 700 · 20px · blanco
  - Subtítulo: "6 ejercicios · ~55 min" · muted
  - Icono intercambiar (top-right): cambiar rutina
  
Bottom nav: Home activo
```

**2.2 Registro de Entrenamiento** `mobile · 390×844`

```
Header:
  - Título rutina · Syne 800 · 28px
  - Timer HH:MM:SS · DM Mono · 16px (izquierda)
  - Button/Primary "FINALIZAR" (derecha)
  
Lista de ejercicios:
  - Card/Exercise por cada ejercicio
  - Scroll vertical
  - Fila activa: highlight naranja
  - Checkbox por set → verde al completar
  - Botón + Serie al final de cada card
  
Nota: inputs de kg y reps usan Input/Number
```

**2.3 Feedback IA Post-Rutina** `mobile · 390×844`

```
Hero:
  - "Felicidades" · Syne 800 · 32px
  - "Entrenamiento finalizado" · Figtree · muted
  
Resumen (3 métricas en fila):
  - Volumen total · DM Mono · data-xl
  - Tiempo · DM Mono · data-xl
  - Series · DM Mono · data-xl
  
PRs si aplica:
  - Badge/PR con Trophy icon
  - "Nuevo récord en Bench Press: 90kg"
  
Card/AI Feedback:
  - Label "ANÁLISIS IA" en blue
  - Texto del análisis
  - Segunda card: "SUGERENCIA"
  
Comparativa:
  - "+500kg vs tu última sesión" · delta verde
  
CTA:
  - Button/Primary "GUARDAR ENTRENAMIENTO" full-width
```

**2.4 Historial y Progreso** `mobile · 390×844`

```
Header:
  - "Historial" · Syne 800 · 28px

Tab switcher:
  - [Progreso] [Sesiones]

Tab Progreso:
  - Selector de ejercicio (dropdown)
  - Gráfica de línea: peso máx por semana
    Línea: #E05C2A · fondo: área bajo la curva rgba(E05C2A, 0.08)
    Eje X: semanas en DM Mono 10px muted
    Eje Y: kg en DM Mono 10px muted
  - Label "Volumen semanal"
  - Gráfica de barras: volumen por semana
    Barras: #14141E con borde · activa: #E05C2A

Tab Sesiones:
  - Lista de Card/Session
  - Cards con badge PR en brass si aplica
  - Scroll infinito
```

**2.5 Rutina Asignada** `mobile · 390×844`

```
Header:
  - Nombre de la rutina · Syne 800 · 28px
  - "Asignada por [Coach]" · Figtree 400 · 12px · muted

Tab de días (scroll horizontal):
  - Pills con días: Lun · Mié · Vie
  - Activo: fondo naranja
  - Inactivo: outline gris

Lista de ejercicios (read-only):
  - Card/Exercise sin inputs editables
  - Muestra: nombre · series × reps objetivo · tiempo descanso
  - Sin checkboxes · Sin botón + Serie

Card/AI si hay notas del coach:
  - Usar Card/AI Feedback con label "NOTA DEL COACH"
  
CTA sticky bottom:
  - Button/Primary "INICIAR RUTINA" full-width
  - Encima del nav bar
```

---

### Flujo 3 — Entrenador (Desktop)

**3.1 Dashboard del Entrenador** `desktop · 1440×900`

```
Layout: Sidebar 220px + Contenido principal

Header del contenido:
  - "Dashboard" · Syne 800 · 28px
  - Fecha actual · Figtree · muted · derecha
  - Avatar del entrenador

KPI row (4 cards):
  - Clientes activos · data-xl
  - Sesiones esta semana · data-xl
  - Adherencia promedio · data-xl · con delta
  - Alertas (inactivos 7+ días) · data-xl · rojo si > 0

Tabla de clientes:
  Columnas: Cliente · Membresía · Última sesión · Adherencia · Acciones
  Filas alternas: #FAFAF7 / #F2F0EB
  Adherencia: barra visual inline (verde/amarillo/rojo según %)
  Acciones: Ver perfil · Asignar rutina

Panel de alertas (sidebar derecho opcional):
  - Clientes sin sesión en 7+ días
  - Membresías por vencer
```

**3.2 Perfil del Cliente** `desktop · 1440×900`

```
Layout: 2 columnas (40% / 60%)

Columna izquierda:
  - Avatar grande + nombre · Syne 800 · 22px
  - Datos: membresía, fecha inicio, plan
  - Métricas resumen: total sesiones, racha, volumen mensual
  - Notas del entrenador (textarea editable inline)
  - Botón "Asignar rutina"

Columna derecha:
  Tab switcher: [Progreso] [Sesiones] [Rutina actual]
  
  Tab Progreso:
    - Selector de músculo/ejercicio
    - Gráfica de línea peso máximo (más grande que mobile)
    - Comparativa meses
  
  Tab Sesiones:
    - Timeline vertical de sesiones
    - Click para expandir y ver sets detallados
    - Badge PR en brass
  
  Tab Rutina actual:
    - Vista read-only de la rutina asignada
    - Botón "Editar rutina"
```

**3.3 Asignación de Rutina** `desktop · 1440×900`

```
Layout: 3 columnas

Col 1 — Banco de ejercicios (260px):
  - Buscador de ejercicios
  - Filtro por grupo muscular
  - Lista de ejercicios arrastrables
  - Card compacta: nombre + grupo muscular

Col 2 — Constructor (central):
  - Nombre de la rutina (editable inline)
  - Tabs por día: Lun · Mar · ... · Dom
  - Drop zone por día: arrastrar ejercicios aquí
  - Card de ejercicio con inputs: series · reps · descanso · notas

Col 3 — Panel de cliente (280px):
  - Selector de cliente(s) a asignar
  - Historial de rutinas anteriores
  - Botón "Guardar como plantilla"
  - Button/Primary "ASIGNAR A CLIENTE"
```

---

### Flujo 4 — Admin (Desktop)

**4.1 Gestión de Membresías** `desktop · 1440×900`

```
Header:
  - "Membresías" · Syne 800 · 28px
  - Button/Primary "+ Nueva membresía"

KPI row (3 cards):
  - Miembros activos
  - Por vencer en 7 días · amarillo si > 0
  - Ingresos del mes · DM Mono

Filtros:
  - Estado: Todos · Activo · Por vencer · Vencido · Cancelado
  - Plan: Todos · Premium · Standard · Trial
  - Buscador

Tabla:
  Columnas: Miembro · Plan · Inicio · Vencimiento · Estado · Acciones
  Estado como Badge: activo/warning/error
  Acciones: Editar · Renovar · Cancelar
  
Footer de tabla:
  - Paginación
  - "Exportar CSV"
```

---

## 12. Reglas de Consistencia

### Tipografía
- Nunca usar Syne para texto de UI, solo para títulos de pantalla y display
- Nunca usar DM Mono para texto corrido o labels de UI
- Nunca usar Figtree para datos numéricos de rendimiento
- El tamaño mínimo de texto en mobile es **11px**

### Color
- Orange `#E05C2A` nunca aparece en más de 2 elementos por pantalla simultáneamente
- Brass `#C8A96E` solo aparece cuando hay un logro real — nunca decorativo
- Blue `#6B7AFF` es exclusivo del sistema de IA — el usuario siempre sabe cuándo habla la IA
- Nunca usar texto negro `#000000` puro — usar `#0A0A0E` en light y `#F5F0E8` en dark

### Componentes
- Todos los inputs tienen label visible — nunca solo placeholder
- Todo estado de error tiene texto de ayuda explicativo debajo del input
- Nunca deshabilitar un botón sin comunicar visualmente el motivo
- El estado vacío de cada pantalla debe estar diseñado — nunca dejar el layout roto

### Mobile
- El bottom nav siempre visible — nunca ocultar en scroll
- Los modals y bottom sheets usan `safe-area-inset-bottom` para el notch
- Nunca más de 3 niveles de profundidad de navegación
- Cada pantalla tiene un solo CTA primario (naranja) visible a la vez

### Desktop
- El sidebar siempre muestra el item activo con el highlight naranja
- Las tablas siempre tienen estado de carga, vacío y error
- Los tooltips aparecen en hover después de 500ms — nunca instantáneo
- Acciones destructivas (cancelar membresía, eliminar) siempre requieren confirmación

### Accesibilidad
- Contraste mínimo: 4.5:1 para texto normal · 3:1 para texto grande
- Todo elemento interactivo tiene estado focus visible
- Los iconos siempre tienen aria-label o texto acompañante
- Los colores nunca son el único medio para comunicar información (siempre acompañados de texto o forma)

---

*Forge Design System · v1.0 · Actualizado: 2025*
