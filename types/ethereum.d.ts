interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isOkxWallet?: boolean;
    isCoinbaseWallet?: boolean;
    isTrust?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
  };
  okxwallet?: {
    request: (request: { method: string; params?: any[] }) => Promise<any>;
  };
  BinanceChain?: any;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export {};
