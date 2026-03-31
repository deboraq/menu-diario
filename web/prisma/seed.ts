import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@empresa.demo";
  const adminPass = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
  const hash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Administración",
      passwordHash: hash,
      role: "ADMIN",
    },
    update: { passwordHash: hash, role: "ADMIN" },
  });

  const today = startOfDay(new Date());
  const deadline = new Date(today);
  deadline.setHours(23, 59, 0, 0);

  const menuDay = await prisma.menuDay.upsert({
    where: { id: "seed-menu-hoy" },
    create: {
      id: "seed-menu-hoy",
      date: today,
      title: "Menú del día",
      visibleFromAt: today,
      deadlineAt: deadline,
      sections: {
        create: [
          {
            title: "¿Qué querés comer hoy?",
            sortOrder: 0,
            items: {
              create: [
                {
                  title: "Opción 1",
                  description:
                    "Suprema a la napolitana con papas bravas.",
                  sortOrder: 0,
                },
                {
                  title: "Opción 2",
                  description:
                    "Suprema a la napolitana con ensalada multicolor.",
                  sortOrder: 1,
                },
                {
                  title: "Opción 3",
                  description:
                    "KETO: Arrollado de pollo (jamón, queso, huevo duro y pimiento rojo y verde) con salsa de queso y calabaza horneada.",
                  tag: "KETO",
                  sortOrder: 2,
                },
                {
                  title: "Opción 4",
                  description:
                    "Risotto de quinoa, tomates secos, choclo y albahaca, acompañado de calabaza gratinada con queso sardo.",
                  tag: "Vegetariano",
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            title: "TARTAS",
            sortOrder: 1,
            items: {
              create: [
                {
                  title: "Opción 1",
                  description:
                    "En Masa de salvado: Atún, merluza, cebolla caramelizada, morrones asados y pimentón ahumado.",
                  sortOrder: 0,
                },
                {
                  title: "Opción 2",
                  description:
                    "En Masa de Salvado con: Dátiles, queso azul, cebolla caramelizada y almendras tostadas.",
                  tag: "Vegetariano",
                  sortOrder: 1,
                },
                {
                  title: "Opción 3",
                  description:
                    "En Masa de salvado: Jamón, Queso, tomate y Albahaca.",
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            title: "ENSALADAS",
            sortOrder: 2,
            items: {
              create: [
                {
                  title: "SUSHI",
                  description:
                    'Arroz "Shari", akusai, kanikama, tamago, pimientos tricolor salteados al wok, semillas de sésamo tostadas, jengibre encurtido, wasabi y emulsión de salsa de soja, miel y salsa de ostras.',
                  sortOrder: 0,
                },
                {
                  title: "CESAR",
                  description:
                    "Blanco de ave, croutons, mézclum de verdes, queso parmesano, aderezo cesar.",
                  sortOrder: 1,
                },
                {
                  title: "PROTEICA",
                  description:
                    "Lentejas, arroz yamani, zapallo brasilero horneado, tomates asados, remolacha grillada, semillas tostadas y dados de tofu con miel de curry.",
                  sortOrder: 2,
                },
                {
                  title: "NIELSEN",
                  description:
                    "Rúcula, Pechuga Grillada, Queso Parmesano y Tomates Cherry, Aderezo Crema de Anchoas y Aceto Balsámico de Reducción.",
                  sortOrder: 3,
                },
                {
                  title: "CHICKEN SALAD",
                  description:
                    "Lechuga, Pollo, Tomates Cherry, Queso Parmesano, Huevo Duro y Aceitunas Negras.",
                  sortOrder: 4,
                },
                {
                  title: "FRIENDLY",
                  description:
                    "Mix de Hojas Verdes, Zapallo Brasilero Asado, Tomates Secos, Dados de Pollo al Limón, Souer Cream con Albahaca y Semillas Tostadas.",
                  sortOrder: 5,
                },
                {
                  title: "MEDITERRÁNEA",
                  description:
                    "Rúcula, Pechuga Grillada, Queso Parmesano y Tomates Cherry, aderezo a elección.",
                  sortOrder: 6,
                },
              ],
            },
          },
          {
            title: "WRAP",
            sortOrder: 3,
            items: {
              create: [
                {
                  title: "Wrap DE POLLO",
                  description:
                    "Blanco de ave, vegetales al wok (salteado de pimientos tricolor, cebolla, zanahoria y zucchini) con pasta de morrón ahumado.",
                  sortOrder: 0,
                },
                {
                  title: "Wrap CAMPESTRE",
                  description:
                    "Vegetales al wok, carne de ternera, queso provoleta y suave lactonesa de salsa criolla.",
                  sortOrder: 1,
                },
              ],
            },
          },
          {
            title: "SANDWICH",
            sortOrder: 4,
            items: {
              create: [
                {
                  title: "Sandwich de Milanesa",
                  description:
                    "Pan de papa artesanal con milanesa de ternera, lechuga, tomate, queso tybo y mayonesa de limón. Con papas fritas.",
                  sortOrder: 0,
                },
                {
                  title: "Sandwich de Pollo",
                  description:
                    "Pan de papa artesanal con pechuga, tomate, lechuga, queso tybo y mayonesa de limón. Con papas fritas.",
                  sortOrder: 1,
                },
                {
                  title: "Sandwich Veggie",
                  description:
                    "Pan de papa artesanal con palta, huevo a la omelette, lechuga, tomate, queso tybo y mayonesa de limón. Con papas fritas.",
                  tag: "Vegetariano",
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
    update: {
      visibleFromAt: today,
      deadlineAt: deadline,
    },
  });

  await prisma.invite.upsert({
    where: { token: "ejemplo-invitacion-demo" },
    create: {
      email: "empleado@empresa.demo",
      token: "ejemplo-invitacion-demo",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
    update: {},
  });

  console.log("Seed OK.");
  console.log("Admin:", adminEmail, "/", adminPass);
  console.log(
    "Invitación de ejemplo (solo demo; en producción cada token es único):",
    `/registro?token=ejemplo-invitacion-demo`
  );
  console.log("Menú del día:", menuDay.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
