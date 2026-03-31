# Guía completa: Supabase + Vercel + GitHub (paso a paso)

Seguí los pasos **en orden**. La app usa **PostgreSQL** en **Supabase**, el código en **GitHub** y el sitio en **Vercel**. La carpeta de la aplicación es **`web`**.

---

## Checklist maestro (orden recomendado)

| # | Qué hacés |
|---|-----------|
| 1–9 | Crear proyecto en Supabase y copiar conexiones |
| 10–16 | Configurar `web/.env` en tu Mac y crear tablas + datos de prueba |
| 17–22 | Subir el código a GitHub (si todavía no está) |
| 23–31 | Crear proyecto en Vercel, variables de entorno y primer deploy |
| 32–34 | Ajustar URL pública y comprobar que todo funciona |

---

## 1. Crear cuenta y proyecto en Supabase

1. Entrá a [https://supabase.com](https://supabase.com) y creá cuenta o iniciá sesión.
2. Clic en **New project**.
3. Elegí la **organización**, el **nombre** del proyecto (ej. `menudiario`), una **contraseña fuerte** para la base (guardala en un lugar seguro) y la **región** más cercana a tus usuarios.
4. Esperá a que el estado del proyecto pase a **Healthy** (puede tardar unos minutos).

## 2. Obtener las dos URLs de conexión (obligatorio)

1. En el panel del proyecto, arriba, hacé clic en **Connect** (o andá a **Project Settings** → ícono de engranaje → **Database**).
2. Buscá **Connection string** y el modo **URI**.
3. **Primera URL — `DATABASE_URL` (pooler):**
   - Elegí **Transaction pooler** (puerto **6543**).
   - Copiá el URI completo. Debe incluir **`pgbouncer=true`** en la query.
   - Reemplazá el placeholder de contraseña por la contraseña del proyecto que definiste al crearlo.
4. **Segunda URL — `DIRECT_URL` (conexión directa):**
   - Elegí **Direct connection** o el string que apunte al host **`db.<algo>.supabase.co`** con puerto **5432**.
   - Copiá ese URI completo y poné la misma contraseña de la base.

> Si algo falla después: no mezcles la URL del pooler con la directa; `DATABASE_URL` = pooler 6543, `DIRECT_URL` = directa 5432.

## 3. Comprobar en Supabase (opcional)

1. En el menú izquierdo podés abrir **Table Editor**. Después del paso 10 vas a ver tablas como `User`, `MenuDay`, etc.

---

## 4. Configurar el proyecto en tu Mac

1. Abrí una terminal.
2. Andá a la carpeta de la app:

   ```bash
   cd ruta/completa/a/menu-diario/web
   ```

3. Si nunca instalaste dependencias:

   ```bash
   npm install
   ```

---

## 5. Editar `web/.env` (sin usar localhost si no tenés Docker)

Abrí el archivo **`web/.env`** en el editor.

1. **Borrá o comentá con `#`** cualquier línea que diga:
   - `DATABASE_URL=...localhost...`
   - `DIRECT_URL=...localhost...`
   - o `file:./dev.db` (SQLite ya no se usa).

2. **Agregá estas líneas** (pegá tus valores reales de Supabase, entre comillas):

   ```env
   DATABASE_URL="pegar-aqui-el-uri-del-transaction-pooler-6543"
   DIRECT_URL="pegar-aqui-el-uri-directo-5432"
   ```

3. **Sesión** — tiene que tener **al menos 32 caracteres**. Ejemplo (cambiá por algo aleatorio en producción):

   ```env
   SESSION_SECRET="una-frase-muy-larga-y-aleatoria-de-mas-de-32-caracteres"
   ```

4. **URL de la app en tu máquina** (para desarrollo):

   ```env
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Opcional:**

   ```env
   NEXT_PUBLIC_CATERER_EMAIL="pedidos@proveedor.com"
   ```

6. Guardá el archivo.

---

## 6. Crear tablas y datos de prueba en Supabase

1. En la terminal, estando en la carpeta **`web`**:

   ```bash
   npm run db:setup
   ```

2. Ese comando hace:
   - `prisma migrate deploy` → crea todas las tablas en Supabase.
   - `prisma db seed` → carga admin de demo y menú de ejemplo (mirá la consola: email y contraseña del admin).

3. Si ves **P1001** o “Can't reach database server at `localhost`”:
   - Tu `.env` todavía apunta a **localhost** o no guardaste los cambios.
   - Volvé al paso 5 y asegurate de que **solo** queden las URLs de Supabase (o seguí el **Apéndice A** si querés usar Docker en local).

4. En Supabase → **Table Editor** deberías ver tablas y filas nuevas.

---

## 7. Arrancar la app en local (opcional)

```bash
cd web
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000), iniciá sesión con el admin que mostró el seed.

---

## 8. Subir el código a GitHub

1. Si el proyecto **no** tiene git en la raíz `menu diario`:

   ```bash
   cd ruta/a/menu-diario
   git init
   git branch -m main
   git add .
   git commit -m "Menú diario: Supabase + Vercel"
   ```

2. En [github.com](https://github.com): **New repository** → nombre → **Create repository** (sin marcar “Add README” si ya tenés archivos locales).

3. Conectá y subí (reemplazá usuario y repo):

   ```bash
   cd ruta/a/menu-diario
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

4. Si ya tenías `origin`, usá `git remote -v` y `git push` según tu caso.

> **Importante:** el archivo **`web/.env`** no debe subirse (está en `.gitignore`). Las claves van solo en Vercel y en tu máquina.

---

## 9. Desplegar en Vercel

1. Entrá a [https://vercel.com](https://vercel.com) e iniciá sesión (**Continue with GitHub** recomendado).
2. **Add New… → Project**.
3. Elegí el repositorio **menu diario** (o el nombre que le hayas puesto).
4. Antes de deploy, en **Configure Project**:
   - **Root Directory**: **Edit** → escribí **`web`** y confirmá. Sin esto el build falla.
5. Desplegá la sección **Environment Variables** y agregá **una por una** (mismos valores que en tu `.env` de Supabase, y un `SESSION_SECRET` fuerte para producción):

   | Nombre | Valor |
   |--------|--------|
   | `DATABASE_URL` | Igual que en `web/.env` (pooler 6543) |
   | `DIRECT_URL` | Igual que en `web/.env` (directa 5432) |
   | `SESSION_SECRET` | Mínimo 32 caracteres (podés generar uno nuevo; no uses el de ejemplo en producción) |
   | `NEXT_PUBLIC_APP_URL` | Por ahora podés poner `https://algo-temporal.vercel.app` o dejarlo y actualizarlo en el paso 11 |
   | `NEXT_PUBLIC_CATERER_EMAIL` | Opcional |

   Marcá **Production** (y **Preview** si querés que los previews también usen la misma base).

   **Importante en Vercel:** al pegar el **Value**, **no pongas comillas** `"` ni antes ni después (solo el texto que empieza con `postgresql://`). **`DATABASE_URL`** tiene que ser el **Transaction pooler** (puerto **6543**, host `…pooler.supabase.com`), **no** el mismo string que `DIRECT_URL` (ese es directo **5432**).

6. Clic en **Deploy**.
7. Esperá a que termine el build. Si falla, abrí **Build Logs**: lo más común es `DATABASE_URL` / `DIRECT_URL` mal pegados o contraseña con caracteres que hay que **encodear** en la URL (`@` → `%40`, etc.).

### Migraciones y error P1001 en Vercel

El build en Vercel ejecuta **`prisma generate && next build`** (no corre `prisma migrate deploy` en la nube). Motivo: desde los servidores de build de Vercel a veces **no se alcanza** el host directo de Supabase (`db…:5432`) y Prisma devuelve **P1001**. Las tablas las creás **desde tu Mac** con `npm run db:setup` o `npx prisma migrate deploy` contra Supabase; el sitio en Vercel solo necesita **`DATABASE_URL`** (pooler) en runtime para la app.

---

## 10. URL pública y redeploy

1. Cuando el deploy termine bien, copiá la URL del proyecto (ej. `https://menu-diario-xxx.vercel.app`).
2. En Vercel: **Project → Settings → Environment Variables**.
3. Editá **`NEXT_PUBLIC_APP_URL`** con esa URL exacta (sin barra al final).
4. Andá a **Deployments**, abrí el último, menú **⋯ → Redeploy** (o hacé un commit vacío y push).

Así los enlaces de recuperación de contraseña apuntan al sitio correcto.

---

## 11. Seguridad después del seed

1. Entrá al sitio en Vercel como admin (usuario del seed o el que hayas creado).
2. Andá a **Admin → Usuarios** y **cambiá la contraseña** del administrador.
3. No uses en producción la contraseña por defecto del seed.

---

## 12. Cambios de base de datos en el futuro

1. Editá `web/prisma/schema.prisma`.
2. En tu Mac, en `web`:

   ```bash
   npx prisma migrate dev --name descripcion_corta
   ```

3. Commiteá la carpeta `web/prisma/migrations` y hacé `git push`.
4. En tu Mac (con `web/.env` apuntando a Supabase), ejecutá **`npx prisma migrate deploy`** para aplicar la migración en la base **antes** de que los usuarios usen el nuevo código (o justo después del deploy).
5. Vercel solo hace **`prisma generate && next build`**; no aplica migraciones en el build.

---

## Apéndice A — Solo si querés Postgres en Docker (local)

Usalo **solo** si no querés tocar Supabase en tu máquina; para producción y Vercel igual necesitás Supabase.

1. Instalá **Docker Desktop** y dejalo corriendo.
2. En `web`:

   ```bash
   docker compose -f docker-compose.postgres.yml up -d
   ```

3. En `web/.env` usá:

   ```env
   DATABASE_URL="postgresql://menu:menu@localhost:5432/menu_diario"
   DIRECT_URL="postgresql://menu:menu@localhost:5432/menu_diario"
   ```

4. `npm run db:setup` y `npm run dev`.

---

## Apéndice B — Archivos de referencia

| Archivo | Para qué sirve |
|---------|----------------|
| `web/prisma/schema.prisma` | Modelos y `directUrl` |
| `web/prisma/migrations/` | Migraciones SQL (subir a git) |
| `web/vercel.json` | Build: `generate` + `next build` (sin migrate en la nube) |
| `web/.env.example` | Plantilla de variables (sin secretos) |

---

Si algo no coincide con tu pantalla (Supabase cambia textos a veces), buscá siempre **Transaction pooler** / **Direct** y los puertos **6543** y **5432**.
