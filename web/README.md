# Menú diario (Next.js)

Base de datos: **PostgreSQL** (Supabase o Docker local). Variables: copiá `.env.example` → `.env`.

```bash
npm install
npx prisma migrate dev   # primera vez / cambios de esquema
npm run dev
```

Despliegue Supabase + Vercel + GitHub: [../GUIA-DEPLOY-SUPABASE-VERCEL.md](../GUIA-DEPLOY-SUPABASE-VERCEL.md)
