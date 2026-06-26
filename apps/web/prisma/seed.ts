import { prisma } from "../lib/prisma";

async function main() {
  const project = await prisma.project.upsert({
    where: { id: "seed_project" },
    update: {},
    create: {
      id: "seed_project",
      title: "Distributed Systems Prep",
      description: "A seeded project for exploring fault-tolerant systems."
    }
  });

  await prisma.thread.upsert({
    where: { id: "seed_thread" },
    update: {},
    create: {
      id: "seed_thread",
      projectId: project.id,
      title: "Fault-tolerant job queues"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
