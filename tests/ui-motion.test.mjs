import test from 'node:test';
import assert from 'node:assert/strict';
import { stepSpring } from '../src/ui/motion.mjs';

test('drawer settles without bounce or overshoot', () => {
  let current = { position: 1, velocity: 0 };
  let previous = 1;
  for (let index = 0; index < 90; index++) {
    current = stepSpring(current.position, current.velocity, 0, 1 / 60);
    assert.ok(current.position >= 0 && current.position <= previous);
    previous = current.position;
  }
  assert.ok(current.position < 0.001);
});

test('retargeting preserves presentation and velocity, then settles at new target', () => {
  let current = stepSpring(1, 0, 0, 0.08);
  assert.deepEqual(stepSpring(current.position, current.velocity, 1, 0), current);
  for (let index = 0; index < 90; index++) current = stepSpring(current.position, current.velocity, 1, 1 / 60);
  assert.ok(Math.abs(current.position - 1) < 0.001);
  assert.ok(Math.abs(current.velocity) < 0.001);
});
