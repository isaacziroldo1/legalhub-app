import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/auth/password";

const prisma = new PrismaClient();

const now = new Date();

function daysFromNow(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date;
}

function json<T>(value: T) {
  return JSON.stringify(value);
}

async function main() {
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.task.deleteMany(),
    prisma.document.deleteMany(),
    prisma.client.deleteMany(),
    prisma.appSetting.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador LegalHub",
      email: "teste@legalhub.com",
      passwordHash: hashPassword("LegalHub@123"),
      role: "admin",
    },
  });

  await prisma.user.create({
    data: {
      name: "Membro LegalHub",
      email: "membro@legalhub.com",
      passwordHash: hashPassword("LegalHub@123"),
      role: "member",
    },
  });

  const settings = await prisma.appSetting.create({
    data: { id: "global", isSmartScanEnabled: true },
  });

  const clients = [
    { name: "Silva & Cia Advogados", cnpj: "12345678000190", status: "Ativo", responsible: "João Silva", email: "contato@silvaecia.com.br", phone: "(11) 3456-7890", address: "Av. Paulista, 1000", city: "São Paulo, SP", createdAt: daysFromNow(-45) },
    { name: "Costa Consultoria Jurídica", cnpj: "98765432000121", status: "Ativo", responsible: "Maria Costa", email: "contato@costajur.com", phone: "(11) 3899-1221", address: "Rua Gomes de Carvalho, 1500", city: "São Paulo, SP", createdAt: daysFromNow(-32) },
    { name: "Oliveira Associates", cnpj: "11222333000144", status: "Ativo", responsible: "Carlos Oliveira", email: "contato@oliveira.assoc", phone: "(21) 2544-9088", address: "Av. Rio Branco, 500", city: "Rio de Janeiro, RJ", createdAt: daysFromNow(-28) },
    { name: "Santos & Martins", cnpj: "55666777000188", status: "Em Prospecção", responsible: "Ana Santos", email: "contato@santosmartins.adv", phone: "(31) 3224-8899", address: "Av. Afonso Pena, 2000", city: "Belo Horizonte, MG", createdAt: daysFromNow(-10) },
    { name: "Ribeiro Consultoria", cnpj: "99888777000155", status: "Ativo", responsible: "Pedro Ribeiro", email: "contato@ribeiro.com", phone: "(51) 3344-5566", address: "Rua dos Andradas, 800", city: "Porto Alegre, RS", createdAt: daysFromNow(-18) },
  ];

  await prisma.client.createMany({
    data: clients.map((client) => ({ ...client, createdAt: client.createdAt })),
  });

  const persistedClients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  const byCnpj = new Map(persistedClients.map((client) => [client.cnpj, client]));

  await prisma.task.createMany({
    data: [
      { title: "Petição Inicial - Silva & Cia", clientId: byCnpj.get("12345678000190")!.id, clientName: "Silva & Cia Advogados", dueDate: daysFromNow(1), status: "todo", priority: "critical", responsible: "JS", createdAt: daysFromNow(-2) },
      { title: "Parecer Jurídico", clientId: byCnpj.get("98765432000121")!.id, clientName: "Costa Consultoria Jurídica", dueDate: daysFromNow(3), status: "drafting", priority: "high", responsible: "MC", createdAt: daysFromNow(-1) },
      { title: "Documento de Defesa", clientId: byCnpj.get("11222333000144")!.id, clientName: "Oliveira Associates", dueDate: daysFromNow(5), status: "review", priority: "normal", responsible: "CO", createdAt: daysFromNow(-1) },
      { title: "Contrato Prestação de Serviços", clientId: byCnpj.get("55666777000188")!.id, clientName: "Santos & Martins", dueDate: daysFromNow(7), status: "review", priority: "normal", responsible: "AS", createdAt: daysFromNow(-3) },
      { title: "Procuração Especial", clientId: byCnpj.get("99888777000155")!.id, clientName: "Ribeiro Consultoria", dueDate: daysFromNow(-1), status: "done", priority: "normal", responsible: "PR", createdAt: daysFromNow(-7), completedAt: daysFromNow(-1) },
    ],
  });

  await prisma.document.createMany({
    data: [
      { name: "Petição - Silva & Cia [Nome_Cliente]", category: "Petições Iniciais", tags: json(["Silva & Cia", "Processo 2024-001"]), variables: json(["[Nome_Cliente]", "[CNPJ_Empresa]"]), autoMappedFields: json({ "[Nome_Cliente]": "Silva & Cia", "[CNPJ_Empresa]": "12345678000190" }), clientId: byCnpj.get("12345678000190")!.id, uploadedAt: daysFromNow(-12) },
      { name: "Petição Defesa - Costa [Data_Protocolo]", category: "Petições Iniciais", tags: json(["Costa Consultoria", "Processo 2024-002"]), variables: json(["[Data_Protocolo]", "[Número_Processo]"]), autoMappedFields: json({ "[Data_Protocolo]": "10/02/2024", "[Número_Processo]": "2024-002" }), clientId: byCnpj.get("98765432000121")!.id, uploadedAt: daysFromNow(-9) },
      { name: "Petição Inicial - Oliveira [CNPJ]", category: "Petições Iniciais", tags: json(["Oliveira Associates", "Processo 2024-003"]), variables: json(["[CNPJ]", "[Razão_Social]"]), autoMappedFields: json({ "[CNPJ]": "11222333000144", "[Razão_Social]": "Oliveira Associates" }), clientId: byCnpj.get("11222333000144")!.id, uploadedAt: daysFromNow(-7) },
      { name: "Petição Reposição - Santos [Valor]", category: "Petições Iniciais", tags: json(["Santos & Martins", "Processo 2024-004"]), variables: json(["[Valor_Causa]", "[Juiz_Responsável]"]), autoMappedFields: json({ "[Valor_Causa]": "15000", "[Juiz_Responsável]": "Dr. Almeida" }), clientId: byCnpj.get("55666777000188")!.id, uploadedAt: daysFromNow(-4) },
    ],
  });

  console.log(`Seed concluido: admin ${admin.email}, member membro@legalhub.com, settings ${settings.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
