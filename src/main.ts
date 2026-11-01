/**
 * Application entry point. The body of index.html is intentionally empty:
 * every visible node is created by code. UI screens are mounted here later.
 */
const createAppRoot = (): HTMLElement => {
  const existing = document.getElementById('app');
  if (existing !== null) {
    return existing;
  }

  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);

  return root;
};

createAppRoot();
