import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies, headers } from "next/headers";

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
};

export type SessionPayload = {
  user?: SessionUser;
};

const COOKIE_NAME = "menu_diario_session";

function buildSessionOptions(secure: boolean): SessionOptions {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET debe tener al menos 32 caracteres. En la carpeta `web`, copiá `.env.example` a `.env` y poné una clave larga y aleatoria (no uses el texto de ejemplo si es corto)."
    );
  }

  return {
    password: secret,
    cookieName: COOKIE_NAME,
    cookieOptions: {
      secure,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}

/** HTTP en localhost / red local: sin Secure para que funcione `npm start` y el navegador guarde la cookie. */
async function shouldUseSecureCookie(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }
  if (
    process.env.SESSION_INSECURE_LOCAL === "1" ||
    process.env.SESSION_INSECURE_LOCAL === "true"
  ) {
    return false;
  }
  try {
    const h = await headers();
    const host = (h.get("host") ?? "").toLowerCase();
    if (
      /^localhost(:\d+)?$/.test(host) ||
      /^127\.0\.0\.1(:\d+)?$/.test(host) ||
      /^192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(host)
    ) {
      return false;
    }
  } catch {
    // sin headers (raro): preferir cookie usable
    return false;
  }
  return true;
}

export async function getSession(): Promise<IronSession<SessionPayload>> {
  const cookieStore = await cookies();
  const secure = await shouldUseSecureCookie();
  const opts = buildSessionOptions(secure);

  try {
    return await getIronSession<SessionPayload>(cookieStore, opts);
  } catch {
    // Cookie inválida (p. ej. cambió SESSION_SECRET): borrar y nueva sesión vacía
    cookieStore.delete(COOKIE_NAME);
    return await getIronSession<SessionPayload>(cookieStore, opts);
  }
}
