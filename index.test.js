import test from "node:test";
import assert from "node:assert/strict";
import { maskObject, maskText } from "./index.js";

test("masks text tokens", () => {
  assert.equal(maskText("key sk-abcdefghijklmnop1234"), "key [REDACTED]");
  assert.equal(maskText("ghp_abcdefghijklmnopqrstuvwx"), "[REDACTED]");
});

test("masks object keys", () => {
  const out = maskObject({ user: "a", password: "hunter2hunter2" });
  assert.equal(out.user, "a");
  assert.match(out.password, /^hunt\.\.\.\[REDACTED\]$/);
});

test("recurses and handles arrays", () => {
  const out = maskObject({ list: [{ token: "x".repeat(30) }] });
  assert.match(out.list[0].token, /REDACTED/);
});

test("leaves clean data alone", () => {
  assert.deepEqual(maskObject({ a: 1, b: "text" }), { a: 1, b: "text" });
});
