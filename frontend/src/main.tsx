import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';
import { WalletProvider } from '@/lib/wallet';
import './index.css';

// El SDK de Stellar usa Buffer, que no existe en el navegador.
(window as unknown as { Buffer: typeof Buffer }).Buffer ??= Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>
);
