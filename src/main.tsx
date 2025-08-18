import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
/*To improve:
    *./src/components/tools:
        Reset Result state when selecting new files 
        Drag & Drop for better UX
        Check Response.json if valid Result object
        Use Result.message for toasts
*/