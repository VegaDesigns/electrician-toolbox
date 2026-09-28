import assert from "node:assert/strict";
import test from "node:test";
import { createCountdown } from "./countdown";

test("undo expires after five seconds, independently of any animation", context => {
  context.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let expired = 0;
  const timer = createCountdown(5000, () => expired++);
  timer.resume();
  context.mock.timers.tick(4999);
  assert.equal(expired, 0);
  context.mock.timers.tick(1);
  assert.equal(expired, 1);
  timer.resume();
  context.mock.timers.tick(5000);
  assert.equal(expired, 1);
});

test("save errors, open forms and background pauses preserve remaining undo time", context => {
  context.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let expired = false;
  const timer = createCountdown(5000, () => { expired = true; });
  timer.resume();
  context.mock.timers.tick(2000);
  assert.equal(timer.pause(), 3000);
  context.mock.timers.tick(60000);
  assert.equal(expired, false);
  assert.equal(timer.resume(), 3000);
  context.mock.timers.tick(2999);
  assert.equal(expired, false);
  context.mock.timers.tick(1);
  assert.equal(expired, true);
});

test("undo/unmount cancels expiry and a later removal gets a fresh countdown", context => {
  context.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let expired = "";
  const old = createCountdown(5000, () => { expired = "old"; });
  old.resume();
  context.mock.timers.tick(4000);
  old.dispose();
  const latest = createCountdown(5000, () => { expired = "latest"; });
  latest.resume();
  context.mock.timers.tick(4999);
  assert.equal(expired, "");
  context.mock.timers.tick(1);
  assert.equal(expired, "latest");
});
