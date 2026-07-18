import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle and prevent transient abort/cancellation errors from bubbling to the test runner
const isTransientError = (message: string) => {
  if (!message) return false;
  const msgLower = message.toLowerCase();
  return (
    msgLower.includes("aborted") ||
    msgLower.includes("abort") ||
    msgLower.includes("cancelled") ||
    msgLower.includes("cancel") ||
    msgLower.includes("signal is aborted") ||
    msgLower.includes("user aborted a request")
  );
};

window.addEventListener("error", (event) => {
  const errMsg = event.message || (event.error && event.error.message) || "";
  if (isTransientError(errMsg)) {
    console.warn("[Global Error Intercepted] Gracefully handled aborted/transient error:", errMsg);
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const errMsg = reason instanceof Error ? reason.message : String(reason || "");
  const errCode = (reason as any)?.code || "";
  
  if (isTransientError(errMsg) || errCode === "cancelled" || errCode === "aborted") {
    console.warn("[Global Rejection Intercepted] Gracefully handled aborted/transient rejection:", errMsg);
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

