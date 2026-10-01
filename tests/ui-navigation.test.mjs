import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the actual navigation handler with delayed browser snapshots.
const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const handler = source.slice(source.indexOf('  const navigate = (path'), source.indexOf('\n  const currentProduct ='));
function setup({ reduced = false, native = true } = {}) {
  let location = '/';
  const visits = [], transitions = [];
  const scope = {
    navigationId: { current: 0 }, transitionRef: { current: null },
    routeLocation: () => location, historyPath: path => path,
    parseRoute: (path = location) => ({ name: path === '/' ? 'home' : path.slice(1) }),
    setMobileOpen() {}, setPanel() {}, setRoute() {}, flushSync: callback => callback(),
    document: { documentElement: { dataset: {} }, querySelector: () => null },
    window: {
      matchMedia: () => ({ matches: reduced }), scrollTo() {},
      history: {
        pushState: (_state, _title, path) => { visits.push(path); location = path; },
        replaceState: (_state, _title, path) => { location = path; },
      },
    },
  };
  if (native) scope.document.startViewTransition = commit => {
    const transition = { commit, skipped: false, skipTransition() { this.skipped = true; }, ready: Promise.resolve(), finished: new Promise(() => {}) };
    transitions.push(transition);
    return transition;
  };
  const navigate = runInNewContext(`${handler}\nnavigate;`, scope);
  return { navigate, transitions, visits, scope, location: () => location };
}

test('a second destination cancels the old snapshot without dropping the new click', () => {
  const state = setup();
  state.navigate('/farm');
  state.navigate('/shop');
  assert.equal(state.transitions[0].skipped, true);
  state.transitions[0].commit();
  state.transitions[1].commit();
  assert.deepEqual(state.visits, ['/shop']);
});

test('repeated navigation during animation never adds a duplicate history entry', () => {
  const state = setup();
  state.navigate('/farm');
  state.transitions[0].commit();
  state.navigate('/farm');
  assert.deepEqual(state.visits, ['/farm']);
  assert.equal(state.transitions.length, 1);
});

test('returning to the original page cancels a not-yet-committed destination', () => {
  const state = setup();
  state.navigate('/farm');
  state.navigate('/');
  state.transitions[0].commit();
  assert.equal(state.location(), '/');
  assert.deepEqual(state.visits, []);
});

test('reduced motion and browsers without View Transitions commit immediately', () => {
  for (const options of [{ reduced: true }, { native: false }]) {
    const state = setup(options);
    state.navigate('/shop');
    assert.equal(state.location(), '/shop');
    assert.equal(state.transitions.length, 0);
  }
});
