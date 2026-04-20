import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "@/app/providers/auth";
import { LanguageProvider } from '@/app/providers/language';
import '@/app/styles/index.scss'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </LanguageProvider>
        </BrowserRouter>
    </StrictMode>,
);
