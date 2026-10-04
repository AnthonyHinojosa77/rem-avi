---
name: grill-me
description: Inverts normal Q&A by producing only questions so the user clarifies context before an artifact is written. Use when a request is underspecified, when building a prompt or skill, or when the user says grill-me, grill this, or asks to surface hidden assumptions before generation. Session answers are context, not the whole artifact. After the session, cross-reference that context with current outside information and write the optimal prompt or spec from both. Questions follow the user's MVP model: this version's one result, marketplace, and next-version list. Never use straw men. Never ask what bad looks like or what would make the user reject the result.
---

# Grill Me

## Purpose

The bottleneck is almost never the model's ability to generate an answer. It is that the request is underspecified. Questions exist to get context the agent cannot recover: city, who acts, what the finished answer should contain, what the user already decided.

Session answers are clarity of context. They are not the end-all of the artifact. A prompt built only by restating those answers is a failed prompt. It reads like a transcript and leaves out how the thing should actually be built.

## Non-negotiable constraints

1. NEVER supply a recommended answer, a straw man, a drafted answer, or a worked example for the user to correct during the question rounds. Do not treat silence as a requirement.
2. NEVER ask what bad looks like, what would make the user throw the result out, what they would reject, or whether the idea is good enough. This user develops the idea while building. Readiness is not a judgment about the idea.
3. Every question carries a stated DEFAULT ("if you don't care, I'll assume X"). A default is not a recommendation. An unaddressed default is context, not a decision, and must be labeled if it enters the artifact.
4. Max 3 questions per round, often 1. Never a ten-question dump.
5. Restate locked context at the top of every round so the user never has to scroll back.
6. Never ask what is already answerable from context, files, memory, or earlier in the thread.
7. Order questions by information gain — the one that would most change the artifact goes first.
8. Never ask the user to provide examples, sample inputs, worked instances, or demonstrations. Descriptions are sufficient. Do not draft an example for them to react to either.

## The loop

1. Restate the target in one line: "You want X, for Y, done when Z". Write `unknown` for any of the three that is unknown — that becomes the first question. "Done" here means this version can be opened, not a finished product vision.
2. Ask 1–3 questions.
3. STOP and wait for the user's reply.
4. Take the answer as context. If vague, press narrower exactly once. If they still do not know, split into one smaller question. Do not offer a wrong draft.
5. Repeat until a stop condition is met.
6. Research, then write the artifact. Do not write the artifact in the same turn as the last question.

Stop conditions: the user says stop, enough context exists to write, or further questions would yield only defaults. If they say "just build it" or show impatience, stop immediately and go to research and writing.

## Question ordering

Apply in this priority order. Skip any already answered by context. These replace rejection questions. They match how this user ships: build the minimum version that starts learning, then measure buyer response. Unfinished work stays private.

1. This version's one result — what one task must a stranger complete alone, from open to result?
2. Marketplace — where would this list, or is it still private? Do not ask the user to define an audience. If they don't care, assume private.
3. This version vs next version — what is in the version being built now, and what is a one-line later item? Do not ask whether an idea should block release.
4. Stage — private, listed, or announced. If they don't care, assume private.
5. Honest claim — what may the screen say today? If they don't care, assume the prompt must not claim a capability the build cannot perform.
6. Boundary — what is explicitly out of this version.
7. Premise check — if the framing is wrong, say so in one line immediately.

Do not ask "what would make you reject this?" or "what does bad look like?"

## When the user gets stuck

"I don't know" means the question was too abstract. Do NOT re-ask it in different words. Do NOT offer a straw man. Split it into one narrower question about this version only. Anything they do not state stays context to resolve in research, not a fake decision.

## Research before the artifact

After the last question round, and before writing the prompt or spec:

1. Take the session context, files, and memory.
2. Cross-reference it with current outside information: how similar products are built, which data sources exist, what a builder can actually do in one pass, and the visual or technical pattern the user already pointed at.
3. Formulate the optimal artifact from both. User answers constrain the product. Outside information supplies the build shape, data fields, and wording a builder needs.
4. Do not paste the session back as the prompt. A build prompt states the product, the screen, the data, and the one result. It does not narrate the questions.

If a user answer conflicts with a hard limit found in research, keep the user's intent and state the limit in one line in the prompt. Do not drop the intent because the session did not mention the limit.

## Prompt mode

Grill only for context that research cannot supply: who acts, which city, what the finished answer must contain, what the user already chose. Do not grill for schema, libraries, or source availability when those can be looked up.

The written prompt is a build instruction. It uses the session as constraints and the research as the implementation frame.

## Output structure

- **Context**: what the user stated, short.
- **From research**: what outside information changed in the artifact, with the source of the limit or pattern.
- **Assumed**: defaults the user left unaddressed.
- The artifact itself: an optimal prompt or spec, not a transcript of the session.

## Divergence handling

If the agent holds a strong contrary view on a design choice, state it once in a single sentence after the questions, labeled "Divergence:". Do not embed the view inside a question. Do not demonstrate it with a straw-man draft.
