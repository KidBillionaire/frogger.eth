import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add Content Security Policy meta tag to allow necessary scripts
const cspMeta = document.createElement('meta');
cspMeta.httpEquiv = "Content-Security-Policy";
cspMeta.content = "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; img-src 'self' data: blob:;";
document.head.appendChild(cspMeta);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
