import { prisma } from "@experiment/db";
import { startEventWorker } from "./event-worker";

const worker = startEventWorker();
const shutdown = async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
