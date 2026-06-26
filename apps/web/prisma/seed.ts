import { prisma } from "../lib/prisma";

async function main() {
  const answerContent =
    "The useful way to learn this is to identify the core concept, notice the hidden prerequisite, and branch only when a detail becomes confusing. Forks keeps the chat natural while turning the answer into reusable project knowledge.";
  const coreConceptStart = answerContent.indexOf("core concept");
  const hiddenPrerequisiteStart = answerContent.indexOf("hidden prerequisite");
  const projectKnowledgeStart = answerContent.indexOf("reusable project knowledge");

  const project = await prisma.project.upsert({
    where: { id: "seed_project" },
    update: {
      title: "Learning With Forks",
      description: "A starter project showing how chat becomes reusable project knowledge."
    },
    create: {
      id: "seed_project",
      title: "Learning With Forks",
      description: "A starter project showing how chat becomes reusable project knowledge."
    }
  });

  const thread = await prisma.thread.upsert({
    where: { id: "seed_thread" },
    update: {
      title: "How Forks helps you learn"
    },
    create: {
      id: "seed_thread",
      projectId: project.id,
      title: "How Forks helps you learn"
    }
  });

  await prisma.chatTurn.upsert({
    where: { id: "turn_seed_user" },
    update: {
      content: "What is the useful way to learn with Forks?"
    },
    create: {
      id: "turn_seed_user",
      projectId: project.id,
      threadId: thread.id,
      role: "USER",
      content: "What is the useful way to learn with Forks?"
    }
  });

  await prisma.chatTurn.upsert({
    where: { id: "turn_seed_assistant" },
    update: {
      content: answerContent
    },
    create: {
      id: "turn_seed_assistant",
      projectId: project.id,
      threadId: thread.id,
      role: "ASSISTANT",
      content: answerContent
    }
  });

  await prisma.node.upsert({
    where: { id: "node_seed_answer" },
    update: {
      title: "Learning Answer",
      content: answerContent
    },
    create: {
      id: "node_seed_answer",
      projectId: project.id,
      threadId: thread.id,
      chatTurnId: "turn_seed_assistant",
      type: "ASSISTANT_ANSWER",
      title: "Learning Answer",
      content: answerContent
    }
  });

  await prisma.span.deleteMany({ where: { projectId: project.id, nodeId: "node_seed_answer" } });
  await prisma.span.createMany({
    data: [
      {
        id: "span_seed_core_concept",
        projectId: project.id,
        nodeId: "node_seed_answer",
        text: "core concept",
        startOffset: coreConceptStart,
        endOffset: coreConceptStart + "core concept".length,
        importanceScore: 0.87,
        ambiguityScore: 0.44
      },
      {
        id: "span_seed_hidden_prerequisite",
        projectId: project.id,
        nodeId: "node_seed_answer",
        text: "hidden prerequisite",
        startOffset: hiddenPrerequisiteStart,
        endOffset: hiddenPrerequisiteStart + "hidden prerequisite".length,
        importanceScore: 0.86,
        ambiguityScore: 0.65
      },
      {
        id: "span_seed_project_knowledge",
        projectId: project.id,
        nodeId: "node_seed_answer",
        text: "reusable project knowledge",
        startOffset: projectKnowledgeStart,
        endOffset: projectKnowledgeStart + "reusable project knowledge".length,
        importanceScore: 0.91,
        ambiguityScore: 0.35
      }
    ]
  });

  await prisma.branchCandidate.deleteMany({ where: { projectId: project.id, sourceNodeId: "node_seed_answer" } });
  await prisma.branchCandidate.createMany({
    data: [
      {
        id: "branch_seed_core_concept",
        projectId: project.id,
        sourceNodeId: "node_seed_answer",
        sourceSpanId: "span_seed_core_concept",
        sourceThreadId: thread.id,
        type: "DEFINITION",
        label: "Define core concept",
        preview: "Clarify the central idea before exploring details.",
        reason: "Core concepts anchor useful learning branches.",
        estimatedValue: 0.89,
        estimatedCost: 0.14,
        status: "LATENT"
      },
      {
        id: "branch_seed_hidden_prerequisite",
        projectId: project.id,
        sourceNodeId: "node_seed_answer",
        sourceSpanId: "span_seed_hidden_prerequisite",
        sourceThreadId: thread.id,
        type: "PREREQUISITE",
        label: "Find the hidden prerequisite",
        preview: "Identify the idea you need before the current explanation fully clicks.",
        reason: "Forks should surface missing prerequisites at the moment of confusion.",
        estimatedValue: 0.92,
        estimatedCost: 0.18,
        status: "LATENT"
      },
      {
        id: "branch_seed_project_knowledge",
        projectId: project.id,
        sourceNodeId: "node_seed_answer",
        sourceSpanId: "span_seed_project_knowledge",
        sourceThreadId: thread.id,
        type: "SUMMARY",
        label: "Explain reusable project knowledge",
        preview: "Show how chat turns become saved concepts, pins, notes, and exports.",
        reason: "This branch explains the purpose of Forks itself.",
        estimatedValue: 0.94,
        estimatedCost: 0.16,
        status: "LATENT"
      }
    ]
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
