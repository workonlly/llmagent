import { PrismaClient, Prisma } from "../src/generated/prisma";

const prisma = new PrismaClient();

const messageData: Prisma.MessageCreateInput[] = [
  {
    content: "Hello, I need help with a coding task",
    role: "USER",
    type: "RESULT",
  },
  {
    content: "Sure! I can help you with that. What do you need?",
    role: "ASSISTANT",
    type: "RESULT",
  },
  {
    content: "Can you create a simple Next.js component for me?",
    role: "USER",
    type: "RESULT",
    fragment: {
      create: {
        sandboxUrl: "https://example.e2b.dev",
        title: "Next.js Component Example",
        files: {
          "app/page.tsx": "export default function Home() { return <div>Hello World</div> }",
        },
      },
    },
  },
  {
    content: "I've created a Next.js component for you. Check the sandbox!",
    role: "ASSISTANT",
    type: "RESULT",
  },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const m of messageData) {
    const message = await prisma.message.create({
      data: m,
    });
    console.log(`Created message with id: ${message.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seeding:");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });