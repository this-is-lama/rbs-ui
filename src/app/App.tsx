import { HashScrollManager, Router } from "./providers/router";
import { ConfirmDialogProvider } from '@/shared/ui/confirm-dialog';


function App() {
  return (
    <ConfirmDialogProvider>
      <>
        <HashScrollManager />
        <Router />
      </>
    </ConfirmDialogProvider>
  )
}

export default App
