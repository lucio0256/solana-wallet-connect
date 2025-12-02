interface TelegramWebApp {
  initDataUnsafe?: { user?: any };
  expand?: () => void;
  close?: () => void;
  sendData?: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
