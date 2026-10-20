import test from "node:test";
import assert from "node:assert/strict";
import { createProject } from "../src/project.mjs";
const claim = { claim: "Event-driven functions execute application code in response to events.", quote: "Event-driven functions execute application code in response to events.", sourceId: "source-1", passageId: "p1" };
const submit = (p, c = claim) => p.tools.submit_brief.execute({ title: "Brief", claims: [c], unanswered: [] });
test("the demo submits four verified extractive citations", async () => {
  const p = createProject(); const s = await p.createAgent().run({ goal: p.goal });
  assert.equal(s.status, "complete"); assert.equal(p.world.brief.claims.length, 4);
});
test("a source must be read before it can be cited", () => {
  assert.throws(() => submit(createProject()), /Read the source/);
});
test("fabricated quotes are rejected", () => {
  const p = createProject(); p.tools.read_source.execute({ id: "source-1" });
  assert.throws(() => submit(p, { ...claim, claim: "Serverless always costs nothing.", quote: "Serverless always costs nothing." }), /does not match/);
});
test("unverified paraphrases are rejected", () => {
  const p = createProject(); p.tools.read_source.execute({ id: "source-1" });
  assert.throws(() => submit(p, { ...claim, claim: "Serverless guarantees reliability" }), /exactly/);
});
test("missing passages are rejected", () => {
  const p = createProject(); p.tools.read_source.execute({ id: "source-1" });
  assert.throws(() => submit(p, { ...claim, passageId: "missing" }), /does not match/);
});
test("the adversarial instruction fixture cannot be submitted as evidence", () => {
  const p = createProject(); const source = p.tools.read_source.execute({ id: "source-3" }); const quote = source.passages[0].text;
  assert.throws(() => submit(p, { claim: quote, quote, sourceId: "source-3", passageId: "p1" }), /Instruction-like/);
});
test("unmatched search returns no fabricated results", () => {
  assert.deepEqual(createProject().tools.search_sources.execute({ query: "unfindablexyz" }), []);
});
