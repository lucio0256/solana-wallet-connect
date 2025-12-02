import { useEffect } from 'react'
import { useDynamicModals } from '@dynamic-labs/sdk-react-core'
import './App.css'
import { AutoSignOnConnect } from './AutoSignOnConnect'

function App() {
  const { setShowLinkNewWalletModal } = useDynamicModals();


  useEffect(() => {
    const webapp = (window as any).Telegram?.WebApp;
    webapp?.expand?.();

    console.log("TG user:", webapp?.initDataUnsafe?.user);

    setShowLinkNewWalletModal(true);
  }, []);

  return (
    <>
        {/* <DynamicWidget /> */}
        <AutoSignOnConnect />
    </>
  )
}

export default App
