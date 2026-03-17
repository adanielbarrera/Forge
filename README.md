# Forge 🏋️

App web de registro de entrenamientos con feedback personalizado mediante IA,
desarrollada para los miembros y entrenadores de un gimnasio pequeño.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | JWT + bcrypt |
| Pagos | Stripe |
| IA / Feedback | OpenAI API |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| Base de datos cloud | Supabase |

## Estructura del Proyecto
```
forge/
├── frontend/        # React + Tailwind CSS
├── backend/         # Node.js + Express + Prisma
└── docs/            # Acta, mockups, documentación
```

## Configuración local

### 1. Clonar el repositorio
```bash
git clone https://github.com/adanielbarrera/forge.git
cd forge
```

### 2. Configurar variables de entorno
```bash
cd backend
cp .env.example .env
# Llenar los valores en .env
```

### 3. Instalar dependencias y correr el backend
```bash
cd backend
npm install
npm run dev
```

### 4. Instalar dependencias y correr el frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno requeridas

Crear `backend/.env` basándose en `backend/.env.example`:
```
DATABASE_URL=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
JWT_SECRET=
PORT=3000
```

## Equipo

Proyecto universitario — Proyecto Integral de Software

## Cliente

Gimnasio olypia gym box