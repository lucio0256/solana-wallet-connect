import ReactDOM from 'react-dom/client';
import App from './App';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';

import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const dynEnv = import.meta.env.VITE_DYNAMIC_ENV_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DynamicContextProvider
    settings={{
    //   environmentId: dynEnv,
      environmentId: dynEnv,
      walletConnectors: [SolanaWalletConnectors],
      initialAuthenticationMode: 'connect-only',
    }}
  >
    <App />
  </DynamicContextProvider>
);
