import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const ROOT_ID = 'dodo-extension-root';
let dodoRoot = document.getElementById(ROOT_ID);

if (!dodoRoot) {
  dodoRoot = document.createElement('div');
  dodoRoot.id = ROOT_ID;
  document.body.append(dodoRoot);
}

const root = createRoot(dodoRoot);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('[dodo] ', 'version', 0.1);
