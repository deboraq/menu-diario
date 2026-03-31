# Guía: Supabase + Vercel + GitHub

La app usa **PostgreSQL** (recomendado **Supabase**) y se despliega en **Vercel**. El repositorio puede vivir en **GitHub** y conectarse a Vercel con un clic.

---

## Parte A — Supabase (base de datos)

1. Entrá a [supabase.com](https://supabase.com), creá cuenta e iniciá sesión.
2. **New project**: elegí organización, nombre, contraseña de la base y región (la más cercana a tus usuarios).
3. Esperá a que termine de provisionar el proyecto.
4. Andá a **Project Settings** (engranaje) → **Database**.
5. En **Connection string**:
   - **Transaction pooler** (puerto **6543**, modo *Transaction*): copiá el URI. Ese valor va a **`DATABASE_URL`** en Vercel y en tu `.env`. Debe incluir **`pgbouncer=true`** (Supabase lo agrega en el string del pooler).
   - **Direct connection** (host **`db.<ref>.supabase.co`**, puerto **5432**): copiá el URI. Ese valor va a **`DIRECT_URL`**. Lo usa Prisma para **migraciones** (`migrate deploy`).
6. Reemplazá `[YOUR-PASSWORD]` por la contraseña que definiste al crear el proyecto.

> Si Vercel no conecta: en la misma sección de Database, revisá que **“Connection pooling”** esté habilitado y usá el string del pooler para `DATABASE_URL`.

---

## Parte B — GitHub (código)

1. Instalá [Git](https://git-scm.com) si no lo tenés.
2. En la carpeta del proyecto (`menu diario` en tu máquina), abrí una terminal:

   ```bash
   cd "/ruta/a/menu diario"
   git init
   git branch -m main
   git add .
   git commit -m "Menú diario: Postgres + Supabase + Vercel"
   ```

3. En [github.com](https://github.com): **New repository** (sin README ni .gitignore si ya los tenés local).
4. Conectá el remoto y subí (reemplazá `TU_USUARIO` y `TU_REPO`):

   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

---

## Parte C — Vercel (hosting)

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (podés usar **Continue with GitHub**).
2. **Add New… → Project** → importá el repo que acabás de crear.
3. **Root Directory**: abrí *Edit* y elegí **`web`**. Es obligatorio: el `package.json` de Next está ahí.
4. **Environment Variables** (antes del primer deploy, o en *Settings → Environment Variables*):

   | Nombre | Valor |
   |--------|--------|
   | `DATABASE_URL` | URI del **pooler** (6543, `pgbouncer=true`) |
   | `DIRECT_URL` | URI **directa** (5432, host `db.xxx.supabase.co`) |
   | `SESSION_SECRET` | Cadena **aleatoria de 32+ caracteres** (generá una nueva; no reutilices la de ejemplo) |
   | `NEXT_PUBLIC_APP_URL` | Después del primer deploy: `https://tu-proyecto.vercel.app` (o tu dominio custom) |
   | `NEXT_PUBLIC_CATERER_EMAIL` | *(Opcional)* Email del proveedor |

   Marcá al menos **Production** (y **Preview** si querés que los PR también usen la misma DB; o usá otra DB de prueba).

5. **Deploy**. El build ejecuta `prisma migrate deploy` y crea las tablas en Supabase.

6. Cuando tengas la URL final de Vercel, actualizá `NEXT_PUBLIC_APP_URL` en Vercel y hacé **Redeploy** para que los enlaces de recuperación de contraseña apunten bien.

---

## Parte D — Datos iniciales (admin de prueba)

El **seed** no corre solo en Vercel (por seguridad). Desde tu PC, con el mismo Supabase:

1. Copiá `web/.env.example` a `web/.env` y pegá **los mismos** `DATABASE_URL`, `DIRECT_URL` y un `SESSION_SECRET` válido.
2. En la carpeta `web`:

   ```bash
   cd web
   npm install
   npx prisma migrate deploy
   npm run db:seed
   ```

3. El seed crea un admin (mirá la consola por email/contraseña por defecto o usá `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` en `.env` antes del seed).

4. **Importante:** en producción cambiá esa contraseña desde el panel **Admin → Usuarios**.

---

## Desarrollo local (sin Supabase)

1. Levantá Postgres:

   ```bash
   cd web
   docker compose -f docker-compose.postgres.yml up -d
   ```

2. En `web/.env`, usá las URLs del bloque “local” en `.env.example` (`menu` / `menu` / `menu_diario`).

3. `npx prisma migrate dev` y `npm run dev`.

---

## Cambios de esquema en el futuro

1. Modificá `web/prisma/schema.prisma`.
2. Local: `cd web && npx prisma migrate dev --name descripcion_del_cambio`.
3. Commiteá la carpeta `web/prisma/migrations`.
4. Push a GitHub → Vercel vuelve a desplegar y aplica migraciones con `prisma migrate deploy`.

---

## Resumen de archivos clave

| Archivo | Rol |
|---------|-----|
| `web/prisma/schema.prisma` | Modelos y `directUrl` |
| `web/prisma/migrations/` | Historial SQL (no borrar) |
| `web/vercel.json` | Build con `migrate deploy` |
| `web/.env.example` | Plantilla de variables |

Si algo falla en el build de Vercel, abrí el log del deploy: suele ser `DATABASE_URL`/`DIRECT_URL` mal copiados o firewall de Supabase (poco frecuente en plan estándar).
