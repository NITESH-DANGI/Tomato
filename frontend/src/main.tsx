import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';


export const authService = 'http://localhost:5000'
export const restaurantService = 'http://localhost:5001'
export const riderService = 'http://localhost:5004'
export const realtimeService = 'http://localhost:5003'
export const utilsService = 'http://localhost:5002'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="127883584161-ebcbm55lavh66p0dm6dfm68hpl6or9us.apps.googleusercontent.com">
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
