# Forks: Product Specification

## 0. One-Line Summary

**Forks** is a project-based learning workspace where native LLM chat creates forkable, mergeable, annotatable knowledge structures. It helps users ask questions naturally, turn assistant answers into interactive learning surfaces, infer useful branches automatically, cache semantic understanding, synthesize branches into polished notes, and export durable learning artifacts.

---

# 1. Product Thesis

Current ChatGPT-style interfaces are bad for deep learning because they are organized as **linear chat transcripts**.

Human learning is not linear.

Humans learn by:

1. encountering an idea,
2. noticing unfamiliar terms,
3. expanding some concepts,
4. ignoring others,
5. comparing explanations,
6. creating examples,
7. resolving confusion,
8. compressing the exploration into memory,
9. revisiting and refining later.

The current chat interface forces the user to repeatedly create prompts, scroll through long threads, regenerate explanations, and manually organize knowledge. This creates cognitive friction.

Forks solves this by making the interface match the natural structure of learning. The product is still chat-native: the user should be able to open a project, start a conversation, and ask questions naturally. The difference is that every assistant answer immediately becomes structured learning material inside that project.

```text
Project -> Chat -> Answer -> Interactive knowledge surface
```

The product should feel less like a linear chatbot and more like a **cognitive operating system for learning**.

---

# 2. Core Product Philosophy

## 2.1 Chat is the creation surface. Learning is the structure.

Traditional chat:

```text
User asks question
Assistant answers
User asks follow-up
Assistant answers
Thread grows forever as text
```

Forks:

```text
Project
 ├── chat thread
 │    ├── user prompt
 │    └── assistant answer as knowledge node
 ├── concepts
 ├── inferred branches
 ├── pinned knowledge
 ├── merged notes
 └── exports
```

Chat is not an import format.

Chat is the primary way new knowledge enters the system. A message still exists, but an assistant message should not remain inert transcript text. It should be parsed into spans, concepts, branches, edges, and reusable project memory.

The core object is not only a message.

The core object is a **knowledge node created from chat**.

---

## 2.2 Expansion should be cheap, synthesis should be intentional

Most AI learning tools expand forever. That becomes chaos.

Forks should make expansion easy, but compression even easier.

The main cognitive moves:

```text
Expand when confused.
Fork when curious.
Merge when ready.
Compress when finished.
Print when understood.
```

These moves are not a required sequence. They are ambient operations available wherever the user's attention is: inside a chat answer, on a hover card, in a branch panel, in pinned knowledge, or inside a synthesis note.

---

## 2.3 The UI should reveal latent structure without forcing generation

A critical product principle:

> The system should infer possible branches, but not generate everything immediately.

The app should show the user that useful learning paths exist without overwhelming them with content.

Branches should be **latent affordances**.

Example:

```text
A distributed queue needs idempotent workers because retries can duplicate side effects.
```

The UI quietly detects:

```text
- Define idempotency
- Explain retries
- Give payment example
- Compare at-least-once vs exactly-once
- Show worker code pattern
- Generate failure-mode diagram
```

But it should not generate all of those immediately.

It should only generate when the user hovers, clicks, expands, pins, or requests synthesis.

---

# 3. Target User

Initial target user:

```text
A technical learner using LLMs to understand complex concepts.
```

Examples:

- software engineering interview prep,
- systems design learning,
- ML/math study,
- legal/contract analysis,
- research paper understanding,
- technical onboarding,
- self-directed education.

The product is especially useful when topics are dense, interconnected, and require repeated explanation at multiple levels of abstraction.

---

# 4. Product Goals

## 4.1 Primary goals

Forks should allow a user to:

1. create projects for learning goals, topics, courses, research areas, or workstreams,
2. start chat threads inside those projects,
3. ask questions as they would in ChatGPT,
4. receive clean, readable assistant answers,
5. have each assistant answer become an interactive knowledge node,
6. hover over important terms for instant lightweight definitions,
7. expand definitions into examples, diagrams, code, and artifacts,
8. automatically see inferred branches,
9. fork any idea in multiple directions,
10. pin useful concepts, branches, and answers to project memory,
11. combine forks into polished notes,
12. cache generated understanding across the project,
13. build a partial semantic mesh of concepts,
14. export/print durable learning artifacts.

---

## 4.2 Non-goals for MVP

The first version should not try to be:

- a full Notion replacement,
- a complete graph database visualization tool,
- a spaced repetition app,
- a full LMS,
- a general-purpose document editor,
- a multi-user collaboration suite,
- a perfect ontology engine.

The MVP should focus on the core learning surface:

```text
Project chat + interactive assistant answers + contextual learning operations
```

Read, hover, branch, expand, pin, merge, and export are not sequential onboarding steps. They are verbs the user can invoke opportunistically while learning.

---

# 5. Key UX Principle: Seamlessness

The user should not feel like they are managing an AI system.

They should feel like they are chatting inside a living project document.

## 5.1 The UI should whisper, not shout

Bad UX:

```text
Here are 17 possible AI suggestions.
Click one to generate more content.
```

Good UX:

```text
Important concepts are subtly alive.
Hover reveals quick meaning.
Click reveals possible directions.
Expand only when needed.
The chat composer is always nearby.
```

---

## 5.2 Progressive disclosure

The interface should reveal complexity in layers, without turning learning into a wizard.

```text
Project state: selected learning context
Chat state: ask or continue naturally
Reading state: clean assistant answer
Hover state: instant micro-definition
Click state: contextual branch card
Expand state: full generated branch
Pin state: saved concept/branch
Merge state: synthesized note
Export state: polished artifact
```

The user can move among these states freely. A user might ask another chat question before hovering anything, pin a branch without merging it, merge weeks later, or export from several threads in the same project.

---

## 5.3 Interaction verbs, not workflow steps

Forks should avoid implying that learning has a fixed order.

The core actions are:

```text
Ask
Read
Hover
Branch
Expand
Pin
Merge
Export
Return
Revise
Ask again
```

These are verbs available in context.

Examples:

```text
The user reads an answer and immediately asks a follow-up.
The user hovers a term but never expands it.
The user expands three branches and pins one.
The user pins concepts across several threads before merging.
The user merges a study note, then asks chat to clarify a weak section.
The user exports from a project after days of accumulated exploration.
```

The UI should therefore be spatial and contextual, not step-based.

---

# 6. Main Interface

The product should have a project-based shell with a native chat workspace at the center.

The primary layout:

```text
Left: projects, threads, notes, exports
Center: chat thread rendered as living knowledge
Right: branches, concept cards, pins, synthesis tools
Bottom: chat composer
```

The center pane is not a pasted transcript area. It is the main learning canvas. User prompts and assistant answers appear conversationally, but assistant answers render as structured knowledge nodes with hoverable spans, branch affordances, source links, and pin controls.

---

## 6.1 Project Home

The project home is the starting point for a learning context.

A project represents a durable learning goal or domain:

```text
Distributed Systems Prep
Operating Systems
Machine Learning
Contract Review
Research Paper: Attention Is All You Need
```

The project home should show:

```text
- active chat threads,
- pinned concepts,
- recent branches,
- merged notes,
- exports,
- suggested next questions or unfinished explorations.
```

The project home should make it easy to start a new chat thread, resume an old one, or continue from pinned knowledge.

---

## 6.2 Learning Chat Workspace

This is the core product surface.

The user chats with the model inside a selected project.

```text
User asks question
Assistant answers
System extracts spans
System infers branches
Answer becomes interactive
Project memory updates
```

The chat workspace should preserve the comfort of conversational AI:

```text
- prompt composer,
- visible user turns,
- visible assistant turns,
- natural follow-up questions,
- regenerating or refining answers,
- thread titles,
- thread history.
```

But assistant turns should also behave like living documents:

```text
- important spans can be hovered,
- paragraphs can expose branch candidates,
- branches can be generated lazily,
- useful pieces can be pinned,
- selected material can be merged,
- concepts update project memory.
```

The product should never feel like the user pasted chat text into a second tool. Chat itself is the tool.

---

## 6.3 Reading State

This is the default mode.

The user sees a clean assistant answer or generated learning document inside the chat thread.

Important terms may have subtle visual affordances:

- faint underline,
- light highlight,
- small margin marker,
- hover state.

Example:

```text
A distributed queue needs idempotent workers because retries can duplicate side effects.
```

Potentially highlighted spans:

```text
distributed queue
idempotent workers
retries
duplicate side effects
```

The default view must stay calm. The user should never feel attacked by suggestions, and branch UI should not compete with reading or chatting.

---

## 6.4 Exploration State

When the user activates a paragraph, span, or node, possible branches appear.

Example:

```text
idempotent workers
 ├── quick definition
 ├── example
 ├── code pattern
 ├── failure mode
 └── relation to exactly-once semantics
```

Exploration mode can use:

- right-side margin,
- side panel,
- collapsible branch tree,
- graph view,
- command palette.

The user should remain spatially anchored to the source text and the chat turn that produced it.

---

## 6.5 Synthesis State

Synthesis mode is where messy exploration becomes clean knowledge.

The user selects branches:

```text
[x] Definition of idempotency
[x] Payment retry example
[x] At-least-once vs exactly-once comparison
[ ] Deep proof
[x] Worker code pattern
```

Then chooses merge intent:

```text
- Make clean study note
- Make interview answer
- Make PDF section
- Make concept map
- Compress into memory
```

Output:

```text
## Idempotency in Distributed Queues

Core idea:
...

Why it matters:
...

Example:
...

Implementation pattern:
...

Common pitfall:
...
```

Synthesis should be available from pinned branches, selected text, selected chat turns, or an entire project. It should not require the user to complete a prescribed exploration path first.

---

# 7. Core Objects

## 7.1 Project / Workspace

A project is the highest-level user-facing container.

The implementation may call this object `Workspace`, but the product language should prefer **Project** because that is how users will think about it: a durable place for a learning goal, topic, class, research effort, or workstream.

Examples:

```text
Modal Systems Prep
Operating Systems
Machine Learning
Contract Review
Distributed Systems
```

A project contains chat threads, concepts, notes, branches, artifacts, exports, and cached knowledge.

```ts
type Workspace = {
  id: string;
  title: string;
  description?: string;
  defaultThreadId?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

---

## 7.2 Chat Thread

A chat thread is an interaction session inside a project.

Unlike a ChatGPT thread, a Forks thread is not purely linear in what it produces. The conversational turns remain ordered for readability, but assistant answers also create nodes, spans, concepts, branches, pins, and edges.

```ts
type Thread = {
  id: string;
  workspaceId: string;
  title: string;
  turnIds: string[];
  rootNodeIds: string[];
  createdAt: Date;
  updatedAt: Date;
};
```

The chat thread is the user's main creation surface. It should support ordinary conversational behavior while also feeding the project knowledge graph.

---

## 7.3 Chat Turn

A chat turn preserves conversational history.

```ts
type ChatTurn = {
  id: string;
  workspaceId: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  nodeId?: string;
  createdAt: Date;
};
```

User turns may create prompt nodes. Assistant turns should create assistant answer nodes.

This separation matters:

```text
ChatTurn = conversation chronology
Node = reusable knowledge object
```

The UI can render chat naturally while the backend stores structured knowledge separately.

---

## 7.4 Node

A node is a unit of generated or user-authored content.

Most nodes are created from chat turns or branches.

Node types:

```text
user_prompt
assistant_answer
definition
example
analogy
proof
implementation
visual_description
artifact
annotation
summary
merged_note
```

```ts
type Node = {
  id: string;
  workspaceId: string;
  threadId?: string;
  chatTurnId?: string;
  type: NodeType;
  title?: string;
  content: string;
  compressedContent?: string;
  parentNodeIds: string[];
  childNodeIds: string[];
  sourceSpanIds?: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
```

---

## 7.5 Span

A span is a specific piece of text inside a node.

Example:

```text
"idempotent workers"
```

A span may map to one or more concepts.

```ts
type Span = {
  id: string;
  nodeId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  conceptIds: string[];
  importanceScore: number;
  ambiguityScore: number;
};
```

---

## 7.6 Concept Card

A concept card is a reusable semantic unit.

This is one of the most important abstractions.

Example concept:

```text
Idempotency
```

Concept card:

```ts
type ConceptCard = {
  id: string;
  workspaceId: string;
  canonicalName: string;
  aliases: string[];
  shortDefinition?: string;
  contextualDefinitions: ContextualDefinition[];
  examples: Example[];
  artifacts: Artifact[];
  linkedConceptIds: string[];
  sourceNodeIds: string[];
  embeddingId?: string;
  confidenceScore: number;
  userMasteryScore?: number;
  createdAt: Date;
  updatedAt: Date;
};
```

The same concept can appear in multiple contexts.

Example:

```text
Cache in CPU architecture
Cache in web systems
Cache in LLM retrieval
```

So definitions must be contextual.

---

## 7.7 Branch Candidate

A branch candidate is an inferred possible direction for expansion from a chat answer, span, paragraph, node, concept, note, or artifact.

Important: a branch candidate does **not** mean generated content exists yet.

```ts
type BranchCandidate = {
  id: string;
  workspaceId: string;
  sourceNodeId: string;
  sourceSpanId?: string;
  sourceThreadId?: string;
  type: BranchType;
  label: string;
  preview?: string;
  reason: string;
  estimatedValue: number;
  estimatedCost: number;
  generatedNodeId?: string;
  status: "latent" | "previewed" | "generated" | "pinned" | "discarded";
};
```

Branch types:

```ts
type BranchType =
  | "definition"
  | "example"
  | "analogy"
  | "formalization"
  | "proof"
  | "implementation"
  | "visual"
  | "contrast"
  | "prerequisite"
  | "pitfall"
  | "edge_case"
  | "artifact"
  | "summary"
  | "merge";
```

---

## 7.8 Pin

A pin saves a useful piece of learning material into project memory.

Pins are lightweight and reversible. The user should be able to pin:

```text
- an assistant answer,
- a span,
- a concept,
- a branch candidate,
- a generated branch,
- a merged note,
- an artifact.
```

```ts
type Pin = {
  id: string;
  workspaceId: string;
  threadId?: string;
  targetId: string;
  targetType: "node" | "span" | "concept" | "branch" | "artifact";
  label?: string;
  note?: string;
  createdAt: Date;
};
```

Pins are the bridge between informal chat exploration and intentional synthesis.

---

## 7.9 Edge

Edges define relationships between knowledge nodes and concepts.

```ts
type Edge = {
  id: string;
  fromId: string;
  toId: string;
  fromType: "node" | "concept";
  toType: "node" | "concept";
  relationship: EdgeRelationship;
  weight: number;
  createdAt: Date;
};
```

Relationship types:

```text
defines
expands
example_of
depends_on
contrasts_with
causes
part_of
implementation_of
pitfall_of
analogy_for
merged_from
supports_claim
challenges_claim
summarizes
```

---

# 8. Automatic Branch Inference

Automatic branch inference is central to the product.

The user should not have to manually decide every follow-up prompt.

The system should inspect generated text and infer possible learning directions.

---

## 8.1 What the system should infer

For every answer, paragraph, sentence, or important span, the system should detect:

```text
1. Undefined concepts
2. Claims that need explanation
3. Claims that need proof
4. Examples that would clarify
5. Implementation opportunities
6. Prerequisite gaps
7. Contrasts with related ideas
8. Failure modes
9. Edge cases
10. Visualizable structures
11. Printable artifact opportunities
```

---

## 8.2 Example

Input sentence:

```text
Consistent hashing reduces remapping when nodes are added or removed.
```

Inferred branches:

```text
[Define consistent hashing]
[Explain remapping]
[Show hash ring diagram]
[Compare to modulo hashing]
[Prove why fewer keys move]
[Give distributed cache example]
[Show implementation]
[Common failure modes]
```

---

## 8.3 Branch inference pipeline

```text
Assistant answer
   ↓
Segment into paragraphs, claims, entities, and spans
   ↓
Extract candidate concepts
   ↓
Classify candidate branches
   ↓
Deduplicate against existing cache
   ↓
Rank by learning value
   ↓
Render top latent branches
   ↓
Generate only when activated
```

---

## 8.4 Branch ranking

Branches should be ranked by usefulness.

Possible scoring formula:

```text
branch_score =
  concept_importance
+ user_likely_confusion
+ local_context_relevance
+ prerequisite_value
+ novelty
- visual_noise_penalty
- generation_cost
- redundancy_penalty
```

Example:

```ts
type BranchScore = {
  conceptImportance: number;
  likelyConfusion: number;
  contextRelevance: number;
  prerequisiteValue: number;
  novelty: number;
  generationCost: number;
  redundancyPenalty: number;
  finalScore: number;
};
```

The UI should show only the top few branches by default.

---

# 9. Hover Definition System

Hover definitions must be instant, lightweight, and context-aware.

## 9.1 Definition layers

Each concept should support multiple levels.

```text
Layer 0: label only
Layer 1: micro-definition
Layer 2: contextual definition
Layer 3: example
Layer 4: deeper explanation
Layer 5: formal explanation
Layer 6: artifact
```

Example:

```text
Term: Idempotency

Micro:
Repeating an operation has the same effect as doing it once.

Contextual:
In distributed queues, idempotent workers prevent retries from causing duplicate side effects.

Example:
A payment job should not charge a customer twice if the job is retried.

Deep:
Idempotency is essential because distributed systems often use at-least-once execution...
```

---

## 9.2 Hover card

Hover card should show:

```text
Idempotency
Repeating an operation has the same effect as doing it once.

[Example] [Go deeper] [Related] [Pin]
```

The first hover should be nearly instant.

The system should prefer cached definitions before calling an LLM.

---

# 10. Forking

Forking allows a user to expand an idea in a specific direction.

## 10.1 Forkable units

The user should be able to fork:

```text
- entire answer
- paragraph
- sentence
- term
- claim
- example
- diagram
- artifact
```

---

## 10.2 Fork intents

Supported fork intents:

```text
Simplify
Go deeper
Formalize
Give example
Give analogy
Prove
Challenge
Show counterexample
Show implementation
Generate visual
Convert to notes
```

---

## 10.3 Fork example

Original:

```text
A distributed queue needs idempotent workers because retries can duplicate side effects.
```

Forks:

```text
- Define idempotent workers
- Explain retries
- Give concrete payment example
- Show code pattern
- Explain exactly-once semantics
- Show failure mode
```

---

# 11. Merging

Merging is how the user compresses exploration into knowledge.

## 11.1 Merge intents

A user can merge selected branches into:

```text
- clean notes
- study guide
- system design answer
- interview response
- concept map
- PDF section
- implementation plan
- final explanation
```

---

## 11.2 Merge behavior

Merging should not simply concatenate branches.

It should:

```text
1. remove redundancy,
2. preserve important distinctions,
3. resolve contradictions,
4. organize by learning order,
5. produce a coherent artifact,
6. link back to source branches.
```

---

## 11.3 Example

Selected branches:

```text
- simple definition of idempotency
- payment retry example
- exactly-once comparison
- worker implementation pattern
```

Merged output:

```text
## Idempotency in Distributed Queues

Core idea:
Idempotency means a repeated operation has the same external effect as one execution.

Why it matters:
Distributed queues often retry jobs after crashes, timeouts, or unclear acknowledgements.

Example:
If a payment worker retries a charge request, an idempotency key prevents duplicate charges.

Implementation pattern:
Store a unique operation key and check whether the operation has already completed before performing side effects.

Common confusion:
Idempotency does not mean the job only runs once. It means repeated runs are safe.
```

---

# 12. LLM Integration

LLM integration is essential, but the product should not be a thin wrapper around one giant prompt.

The system should use many small, specialized LLM calls.

---

## 12.1 Core LLM tasks

The LLM should support:

```text
1. project-aware chat answer generation
2. thread title generation
3. term extraction
4. span classification
5. branch inference
6. micro-definition generation
7. contextual definition generation
8. example generation
9. analogy generation
10. formal explanation generation
11. artifact generation
12. merge/synthesis
13. compression
14. contradiction detection
15. user mastery estimation
```

---

## 12.2 Avoid giant prompts

Bad architecture:

```text
Send entire thread to model every time.
Ask it to answer, define terms, infer branches, create examples, and summarize.
```

Better architecture:

```text
Use small model calls with narrow responsibilities.
Retrieve only relevant context.
Cache outputs aggressively.
Generate lazily.
```

---

## 12.3 Chat-to-knowledge pipeline

When a user sends a chat message inside a project:

```text
User prompt in project thread
   ↓
Save user chat turn
   ↓
Retrieve relevant workspace context
   ↓
Generate assistant answer
   ↓
Save assistant chat turn
   ↓
Save assistant answer node
   ↓
Extract spans/concepts
   ↓
Infer branch candidates
   ↓
Cache micro-definitions if cheap
   ↓
Render clean answer with latent affordances
```

Pseudo-flow:

```ts
async function handleUserPrompt(input: {
  prompt: string;
  workspaceId: string;
  threadId: string;
}) {
  const userTurn = await saveChatTurn({
    workspaceId: input.workspaceId,
    threadId: input.threadId,
    role: "user",
    content: input.prompt,
  });

  const context = await retrieveRelevantContext({
    prompt: input.prompt,
    workspaceId: input.workspaceId,
    threadId: input.threadId,
  });

  const answer = await generateAnswer({
    prompt: input.prompt,
    context,
    userModel: await getUserLearningProfile(input.workspaceId),
  });

  const assistantTurn = await saveChatTurn({
    workspaceId: input.workspaceId,
    threadId: input.threadId,
    role: "assistant",
    content: answer.content,
  });

  const node = await saveNode({
    ...answer,
    workspaceId: input.workspaceId,
    threadId: input.threadId,
    chatTurnId: assistantTurn.id,
    parentNodeIds: userTurn.nodeId ? [userTurn.nodeId] : [],
  });

  const spans = await extractImportantSpans(answer.content);
  await saveSpans(node.id, spans);

  const concepts = await resolveConcepts(spans, input.workspaceId);
  await saveConceptLinks(spans, concepts);

  const branches = await inferBranches({
    answer,
    spans,
    concepts,
    workspaceContext: context,
    threadId: input.threadId,
  });

  await saveBranchCandidates(branches);

  return renderChatTurnWithAffordances({
    turn: assistantTurn,
    node,
    spans,
    branches,
  });
}
```

---

## 12.4 Model selection

Different tasks can use different model sizes.

```text
Small/cheap model:
- span extraction
- branch classification
- title generation
- tag generation
- micro-definition first pass

Medium model:
- contextual definitions
- examples
- analogies

Large/reasoning model:
- synthesis
- contradiction resolution
- formal explanations
- proofs
- deep technical answers
- artifact generation
```

This keeps the system fast and cheaper.

---

## 12.5 LLM as parser, generator, and compressor

The LLM has three major roles.

### Parser

It identifies structure inside text.

```text
terms
claims
relationships
branch candidates
dependencies
confusions
```

### Generator

It creates new content.

```text
definitions
examples
proofs
diagrams
notes
artifacts
```

### Compressor

It turns messy exploration into compact, reusable knowledge.

```text
summary
canonical concept card
compressed semantic representation
printable note
```

---

# 13. Prompt Architecture

## 13.1 Answer generation prompt

Purpose:

Generate a clean explanation that can later be parsed into concepts and branches.

Important instruction:

The answer should be structured, but not overformatted.

```text
You are generating a learning explanation for a user.
Explain the concept clearly.
Prefer concrete examples.
Use short sections.
Avoid hiding important terms.
Do not over-expand every concept.
Leave room for progressive exploration.
```

---

## 13.2 Span extraction prompt

Purpose:

Detect terms and claims worth making interactive.

Expected output:

```json
{
  "spans": [
    {
      "text": "idempotent workers",
      "type": "concept",
      "importance": 0.92,
      "likely_confusion": 0.78,
      "reason": "Core prerequisite for understanding distributed queue retry safety."
    }
  ]
}
```

---

## 13.3 Branch inference prompt

Purpose:

Infer useful latent branches.

Expected output:

```json
{
  "branches": [
    {
      "source_span": "idempotent workers",
      "type": "definition",
      "label": "Define idempotent workers",
      "preview": "Why repeated worker execution should be safe.",
      "estimated_value": 0.91,
      "estimated_cost": 0.12
    },
    {
      "source_span": "idempotent workers",
      "type": "implementation",
      "label": "Show worker code pattern",
      "preview": "How to use an idempotency key to prevent duplicate side effects.",
      "estimated_value": 0.84,
      "estimated_cost": 0.42
    }
  ]
}
```

---

## 13.4 Micro-definition prompt

Purpose:

Generate very short definitions.

```text
Define the term in the local context.
Use one sentence.
Do not exceed 25 words.
Avoid circular definitions.
Prefer concrete language.
```

---

## 13.5 Expansion prompt

Purpose:

Expand a concept into useful learning structure.

```text
Explain this concept using:
1. core intuition,
2. concrete example,
3. formal version,
4. common misconception,
5. relation to nearby concepts.
```

---

## 13.6 Merge prompt

Purpose:

Synthesize selected branches.

```text
Given these selected branches, synthesize them into one coherent learning note.

Rules:
- Do not concatenate.
- Remove redundancy.
- Preserve important distinctions.
- Put ideas in learning order.
- Include examples when they clarify.
- End with what the user should remember.
```

---

## 13.7 Compression prompt

Purpose:

Turn expanded content into compact semantic form.

```text
Compress this learning content into a reusable concept representation.

Return:
- canonical name
- aliases
- one-line definition
- core intuition
- prerequisite concepts
- related concepts
- examples as references
- common pitfalls
- compressed semantic summary
```

---

# 14. Storage Architecture

The product will generate a lot of content. Storage needs to be intentional.

Use layered storage:

```text
Raw content
Structured content
Compressed semantic representation
Embeddings
Cache entries
Artifacts
```

---

## 14.1 Recommended stack

```text
Frontend:
- Next.js
- React
- TipTap or Lexical editor
- React Flow for graph/exploration view

Backend:
- Node.js/NestJS or Next.js API routes initially
- PostgreSQL
- pgvector
- Redis
- object storage for artifacts

LLM:
- OpenAI or comparable model provider
- small model for parsing/classification
- stronger model for synthesis/reasoning
```

---

## 14.2 Database tables

Core tables:

```text
workspaces/projects
threads
chat_turns
nodes
spans
concepts
concept_layers
branch_candidates
pins
edges
artifacts
embeddings
cache_entries
compressed_units
user_annotations
```

---

# 15. Caching Strategy

The system should avoid repeated regeneration.

## 15.1 Cache layers

### Layer 1: exact cache

Same term, same context, same depth.

```text
term + context_hash + depth → generated content
```

### Layer 2: concept cache

If the concept already exists, reuse its card.

```text
"idempotency" → ConceptCard
```

### Layer 3: semantic cache

Search for similar content using embeddings.

```text
"safe retries in distributed jobs"
≈ "idempotent workers in queues"
```

### Layer 4: branch cache

If a branch was already generated, reopen it.

```text
source_node + branch_type + span → generated_node
```

### Layer 5: artifact cache

If a diagram, PDF section, or other artifact already exists, reuse or update it.

---

## 15.2 Cache key design

A cache key should include:

```ts
type CacheKey = {
  workspaceId: string;
  taskType: string;
  canonicalTerm?: string;
  sourceNodeHash?: string;
  contextHash: string;
  depth?: "micro" | "contextual" | "deep" | "formal";
  modelVersion: string;
  promptVersion: string;
};
```

This prevents stale or mismatched outputs.

---

# 16. Compressed Content and Grammar Engine

This is a major architectural idea.

Because Forks generates so much content, the system should not store every expanded explanation as long prose forever.

Instead, it should store both:

```text
1. user-visible generated content,
2. compressed semantic representations.
```

The compressed representation can later be “decompressed” into prose, notes, examples, diagrams, or artifacts.

Important terminology:

- **Compression** = reduce generated content into structured semantic units.
- **Decompression** = regenerate readable content from compressed units.
- **Encryption/decryption** = only relevant if you are protecting content cryptographically.

For this product, the main thing is not encryption. It is **semantic compression and regeneration**.

---

## 16.1 Why compression matters

Without compression, the system becomes bloated:

```text
Every hover creates text.
Every fork creates text.
Every branch creates text.
Every merge creates text.
Every example creates text.
```

You quickly get thousands of paragraphs.

Most are redundant.

Instead, the system should store canonical compact forms.

Example long content:

```text
Idempotency means that if an operation is repeated multiple times, the final result is the same as if it happened once. In distributed queues this matters because workers can crash after performing a side effect but before acknowledging completion...
```

Compressed representation:

```json
{
  "concept": "idempotency",
  "domain": "distributed systems",
  "core": "Repeated execution has same external effect as single execution.",
  "why_it_matters": "Retries may duplicate side effects.",
  "example_refs": ["payment_retry"],
  "related": ["at_least_once_delivery", "exactly_once_semantics", "idempotency_key"],
  "pitfalls": ["does_not_mean_runs_once"]
}
```

The product can regenerate different surfaces from this:

```text
- hover definition
- deep explanation
- interview note
- diagram caption
- PDF section
```

---

## 16.2 Grammar engine

The “grammar engine” is the layer that turns compressed semantic representations into different outputs.

Think of it as:

```text
Semantic IR → Grammar Engine → Surface Form
```

Where IR means intermediate representation.

Example:

```text
Compressed Concept Object
   ↓
Grammar Engine
   ↓
Micro-definition / Example / Note / Diagram / PDF section
```

---

## 16.3 Semantic IR

A concept should be compressed into a structured object.

```ts
type SemanticConceptIR = {
  id: string;
  canonicalName: string;
  domain?: string;
  aliases: string[];

  coreDefinition: string;
  intuition?: string;

  prerequisites: ConceptRef[];
  relatedConcepts: ConceptRef[];

  examples: ExampleRef[];
  counterexamples?: ExampleRef[];

  commonPitfalls: string[];

  formalVersion?: string;
  implementationPattern?: string;

  sourceRefs: SourceRef[];

  confidence: number;
};
```

Example:

```json
{
  "canonicalName": "Idempotency",
  "domain": "distributed systems",
  "aliases": ["idempotent operation", "idempotent worker"],
  "coreDefinition": "Repeated execution has the same external effect as a single execution.",
  "intuition": "Retries are allowed because repeats are safe.",
  "prerequisites": ["retry", "side effect", "distributed queue"],
  "relatedConcepts": ["at-least-once delivery", "exactly-once semantics", "idempotency key"],
  "examples": ["payment_retry", "email_send_deduplication"],
  "commonPitfalls": [
    "Idempotency does not mean the code runs only once.",
    "Idempotency does not automatically prevent all race conditions."
  ],
  "implementationPattern": "Store a unique operation key and check completion before performing external side effects.",
  "confidence": 0.91
}
```

---

## 16.4 Grammar templates

The grammar engine can use templates plus LLM smoothing.

### Micro-definition template

```text
{{canonicalName}}: {{coreDefinition}}
```

Output:

```text
Idempotency: repeated execution has the same external effect as a single execution.
```

### Contextual explanation template

```text
In {{domain}}, {{canonicalName}} matters because {{why_it_matters}}.
```

Output:

```text
In distributed systems, idempotency matters because retries may duplicate side effects.
```

### Interview answer template

```text
The core idea is {{coreDefinition}}. 
This matters in {{domain}} because {{why_it_matters}}. 
A concrete example is {{example}}. 
A common misconception is {{pitfall}}.
```

---

## 16.5 Hybrid decompression

There are two ways to decompress compressed content.

### Deterministic decompression

Use templates.

Pros:

```text
fast
cheap
consistent
predictable
```

Cons:

```text
can sound stiff
less adaptive
```

### LLM-assisted decompression

Use compressed IR as input to the model.

Pros:

```text
natural
adaptive
can target user level
can produce many formats
```

Cons:

```text
slower
costlier
less deterministic
```

Best architecture:

```text
Use deterministic templates for hovers and simple outputs.
Use LLM-assisted decompression for deep explanations, polished notes, and artifacts.
```

---

## 16.6 Compression pipeline

When content is generated, do not just save the prose.

Run a compression step.

```text
Generated branch
   ↓
Extract semantic units
   ↓
Resolve concepts
   ↓
Update concept cards
   ↓
Store compressed IR
   ↓
Store raw content optionally
   ↓
Index embeddings
```

Pseudo-code:

```ts
async function compressGeneratedNode(node: Node) {
  const semanticUnits = await extractSemanticUnits(node.content);

  for (const unit of semanticUnits) {
    const concept = await resolveOrCreateConcept(unit);
    const updatedIR = await updateConceptIR(concept, unit);
    await saveCompressedIR(concept.id, updatedIR);
    await updateEmbeddings(concept.id, updatedIR);
  }
}
```

---

## 16.7 What to store raw vs compressed

Store raw content when:

```text
- user edited it manually,
- it was pinned,
- it is part of a final note,
- it is an artifact,
- it contains nuanced reasoning,
- it came from an external source,
- the user explicitly saved it.
```

Compress and optionally discard raw content when:

```text
- it is an unpinned hover definition,
- it is a redundant branch,
- it is a temporary preview,
- it is superseded by a better merge.
```

---

## 16.8 Content lifecycle

```text
Latent branch
   ↓
Preview
   ↓
Generated branch
   ↓
Compressed semantic unit
   ↓
Pinned or discarded
   ↓
Merged into note
   ↓
Archived as compressed IR + source refs
```

---

# 17. Retrieval-Augmented Generation

The system needs retrieval so it does not regenerate everything from scratch.

## 17.1 Retrieval sources

For every LLM generation, retrieve:

```text
- current source node,
- nearby paragraphs,
- linked concept cards,
- compressed IR,
- relevant prior user notes,
- relevant generated branches,
- user learning profile,
- pinned notes,
- artifact summaries.
```

---

## 17.2 Retrieval hierarchy

When the user requests expansion:

```text
1. exact generated branch exists?
2. exact concept layer exists?
3. compressed IR exists?
4. semantically similar concept exists?
5. related workspace context exists?
6. generate fresh
```

---

## 17.3 Example

User hovers over “idempotency.”

System checks:

```text
1. Is there an exact hover definition cached?
2. Is there a concept card for idempotency?
3. Is there compressed IR for idempotency in distributed systems?
4. Is there a prior branch about idempotent workers?
5. If yes, render from cache.
6. If no, call model.
```

---

# 18. Personal Learning Model

The product should maintain a lightweight model of the user’s understanding.

Do not overcomplicate this initially.

Track:

```text
- concepts hovered,
- concepts expanded,
- branches pinned,
- branches discarded,
- concepts repeatedly revisited,
- user annotations,
- user edits.
```

Use this to infer:

```text
- likely confusion,
- preferred depth,
- known prerequisites,
- recurring interests,
- concepts that need review.
```

Example:

```text
The user frequently expands:
- cache coherence
- distributed queues
- idempotency
- consistency

The system infers:
The user is learning fault tolerance and systems fundamentals.
```

This improves branch ranking.

---

# 19. Printing and Export

Printing is not an afterthought.

It is one durable output of the learning workspace.

Export may happen at the end of a study session, in the middle of a project, or repeatedly as notes improve. It should not be framed as the mandatory final step of a fixed workflow.

The user should be able to turn exploration into:

```text
- PDF notes
- study packet
- interview prep packet
- concept map
- annotated transcript
- clean markdown
- LaTeX-style technical notes
```

---

## 19.1 Print flow

```text
Select project/thread/branches/pins/notes
   ↓
Choose export type
   ↓
Choose depth
   ↓
Generate synthesis
   ↓
Preview
   ↓
Edit
   ↓
Export
```

---

## 19.2 Export types

```text
Concise notes
Deep notes
Cheat sheet
Interview prep
Glossary
Concept map
Code appendix
```

---

# 20. MVP

## 20.1 MVP scope

The MVP should prove that native project chat can become interactive learning material.

```text
1. User creates or opens a project.
2. User starts or resumes a chat thread inside the project.
3. User asks a question naturally.
4. Assistant generates an answer in the chat.
5. System saves the answer as a knowledge node.
6. System extracts important spans.
7. Important spans become hoverable.
8. Hover shows cached or generated micro-definition.
9. System suggests latent branches contextually.
10. User can expand a span or branch into a branch card.
11. User can pin useful answers, concepts, or branches.
12. User can merge selected pinned material into notes.
13. User can export notes as markdown or PDF.
```

This is still not a required user sequence. It is the minimum set of capabilities needed to make the product feel like Forks instead of a normal chatbot or a static document annotator.

---

## 20.2 MVP screens

### Screen 1: Project home

```text
Projects:
- Modal Systems Prep
- Operating Systems
- Distributed Systems

Selected project:
- chat threads
- pinned concepts
- recent branches
- merged notes
- exports
```

### Screen 2: Learning chat thread

```text
Left: project/thread navigation
Center: chat thread with interactive assistant answers
Right: branch margin / concept cards / pinned material
Bottom: chat composer
```

### Screen 3: Branch card

```text
Title
Micro-definition
Expansion options
Generated content
Pin / Merge / Discard
```

### Screen 4: Synthesis editor

```text
Selected branches
Merge intent
Generated note
Editable final output
```

### Screen 5: Export

```text
Markdown
PDF
```

---

## 20.3 MVP technical stack

```text
Frontend:
Next.js
React
TipTap or Lexical
React Flow later

Backend:
Next.js API routes initially
PostgreSQL
pgvector
Redis

LLM:
OpenAI API or equivalent

Export:
Markdown first
Puppeteer PDF later
```

---

# 21. V1 Technical Architecture

## 21.1 System diagram

```text
Frontend
  |
  | project selection / chat prompt / hover / expand / pin / merge / export
  v
API Server
  |
  ├── Postgres: structured content
  ├── pgvector: semantic retrieval
  ├── Redis: fast cache
  ├── Object Storage: artifacts / PDFs
  └── LLM Orchestrator
          |
          ├── chat answer generator
          ├── span extractor
          ├── branch inferencer
          ├── definition generator
          ├── compression engine
          ├── merge engine
          └── artifact generator
```

---

## 21.2 LLM orchestration service

The LLM orchestrator should expose task-specific functions.

```ts
class LLMOrchestrator {
  generateAnswer(input: GenerateAnswerInput): Promise<Node>;
  extractSpans(input: ExtractSpansInput): Promise<Span[]>;
  inferBranches(input: InferBranchesInput): Promise<BranchCandidate[]>;
  generateDefinition(input: DefinitionInput): Promise<ConceptLayer>;
  generateBranch(input: BranchInput): Promise<Node>;
  mergeBranches(input: MergeInput): Promise<Node>;
  compressNode(input: CompressInput): Promise<SemanticConceptIR[]>;
  decompressConcept(input: DecompressInput): Promise<string>;
}
```

---

# 22. Suggested Repository Structure

```text
forks/
  apps/
    web/
      app/
      components/
      lib/
      styles/
  packages/
    db/
      schema.prisma
      migrations/
    llm/
      orchestrator.ts
      prompts/
      tasks/
    grammar/
      ir/
      templates/
      decompressors/
    retrieval/
      embeddings.ts
      search.ts
    cache/
      redis.ts
      keys.ts
    export/
      markdown.ts
      pdf.ts
  docs/
    PRODUCT_SPEC.md
    ARCHITECTURE.md
    PROMPTS.md
```

---

# 23. Critical Technical Challenges

## 23.1 UI clutter

Risk:

```text
Too many branches make the interface unusable.
```

Solution:

```text
- show only top branches by default,
- use progressive disclosure,
- rank by usefulness,
- let users control density.
```

---

## 23.2 Latency

Risk:

```text
Hover definitions feel slow.
```

Solution:

```text
- precompute micro-definitions for high-score spans,
- use Redis,
- use deterministic decompression from compressed IR,
- lazy-generate deeper layers.
```

---

## 23.3 Content explosion

Risk:

```text
The app stores endless redundant prose.
```

Solution:

```text
- compress generated content into semantic IR,
- deduplicate concepts,
- store raw only when pinned or meaningful,
- use branch lifecycle states.
```

---

## 23.4 Bad branch suggestions

Risk:

```text
The app suggests irrelevant or obvious branches.
```

Solution:

```text
- branch scoring,
- user feedback,
- personalization,
- hidden/discarded branch tracking,
- prompt versioning.
```

---

## 23.5 Merge quality

Risk:

```text
Merged notes are redundant or shallow.
```

Solution:

```text
- use stronger model for synthesis,
- pass compressed IR plus selected raw branch content,
- use merge intent,
- include source structure,
- allow user editing.
```

---

# 24. Product Differentiation

Forks is not:

```text
- a plain chatbot,
- a mind map,
- a note-taking app,
- a flashcard app,
- a PDF generator,
- a graph database UI.
```

Forks is:

```text
A project-based AI learning environment where chat creates reusable structured knowledge.
```

Its differentiator is the combination of:

```text
1. automatic branch inference,
2. seamless hover definitions,
3. latent branches,
4. semantic caching,
5. fork/merge learning,
6. compressed concept memory,
7. printable synthesis.
```

---

# 25. North Star Experience

The product succeeds when the user thinks:

> I did not have to formulate the next question. The interface surfaced the next useful mental move exactly where I needed it.

The ideal experience is not a fixed flow. It is a feeling of available moves:

```text
I can ask naturally.
I can read calmly.
I can hover when a term is fuzzy.
I can branch when curiosity appears.
I can pin when something matters.
I can merge when I am ready to synthesize.
I can export when I want something durable.
I can return later and keep building.
```

---

# 26. MVP Build Order

## Phase 1: Project-based chat with interactive answers

Build:

```text
- project creation/opening
- chat thread creation
- prompt composer
- user and assistant turns
- assistant answer rendering
- span extraction
- hoverable terms
- micro-definition cache
```

Do not build graph view yet. The first proof is that a normal chat answer can become an interactive knowledge surface inside a project.

---

## Phase 2: Branch cards

Build:

```text
- branch inference
- latent branch display
- click to generate branch
- pin/discard
```

---

## Phase 3: Concept cache

Build:

```text
- concept cards
- aliases
- concept layers
- semantic retrieval with pgvector
```

---

## Phase 4: Merge and synthesis

Build:

```text
- select pinned branches
- merge into clean note
- editable synthesis editor
```

---

## Phase 5: Compression engine

Build:

```text
- semantic IR extraction
- compressed concept storage
- deterministic decompression templates
- LLM-assisted decompression
```

---

## Phase 6: Export

Build:

```text
- markdown export
- PDF export
- glossary export
```

---

# 27. Example End-to-End Flow

User opens a project:

```text
Distributed Systems Prep
```

User starts or resumes a chat thread:

```text
Fault-tolerant job queues
```

User asks:

```text
Explain distributed job queues.
```

Assistant generates:

```text
A distributed job queue lets workers process jobs asynchronously across many machines. 
Because workers can crash or retry jobs, the system often uses at-least-once delivery and idempotent handlers.
```

The assistant answer is saved as both:

```text
- a chat turn in the thread,
- a knowledge node in the project.
```

System extracts spans:

```text
distributed job queue
workers
asynchronously
crash
retry
at-least-once delivery
idempotent handlers
```

System infers branches:

```text
distributed job queue
 ├── definition
 ├── architecture diagram
 ├── implementation sketch
 └── failure modes

at-least-once delivery
 ├── definition
 ├── contrast with exactly-once
 ├── duplicate job example
 └── why systems choose it

idempotent handlers
 ├── definition
 ├── payment example
 ├── code pattern
 └── common misconception
```

User hovers over:

```text
idempotent handlers
```

Instant card:

```text
Handlers that can safely run multiple times without causing duplicate external effects.
```

User clicks:

```text
Example
```

Generated branch:

```text
If a payment job is retried after a timeout, the handler checks an idempotency key before charging the customer again.
```

User pins:

```text
idempotency definition
payment example
at-least-once contrast
```

The user may now ask another chat question instead of merging:

```text
How does this change if jobs are not idempotent?
```

Or the user may continue exploring branches. Merging is available, not mandatory.

User merges into:

```text
Distributed Queue Fault Tolerance Note
```

Final output:

```text
Distributed queues usually prefer at-least-once delivery because it is safer to retry work than silently lose jobs. This means workers must be idempotent...
```

System compresses:

```json
{
  "concept": "idempotent handler",
  "domain": "distributed job queues",
  "core": "A handler that can safely execute multiple times without duplicate side effects.",
  "related": ["at-least-once delivery", "retry", "deduplication"],
  "example_refs": ["payment_retry"],
  "pitfalls": ["does not mean job runs once"]
}
```

Later, when the user sees “idempotency” again, the system reuses the compressed concept instead of regenerating from scratch.

---

# 28. Final Product Definition

Forks is a project-based learning environment where native LLM chat becomes structured, reusable, forkable knowledge.

It turns this:

```text
project chat that would normally become a linear transcript
```

Into this:

```text
living chat document
+ latent branch graph
+ concept cache
+ semantic compression engine
+ printable synthesis layer
```

The deepest product insight is:

> The interface should let users ask naturally, then infer possible next mental moves and make them available at the exact place where the user needs them.

That is the ergonomic learning system.
