import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { base } from "viem/chains";
import MarriageCertificateDapp from "./components/MarriageCertificateDapp";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Routes, Route } from 'react-router-dom';
import JoinMarriage from "./components/JoinMarriage";
import { UserType } from './types/UserType'; 

// Create a wrapper component to access Privy authentication state
const JoinMarriageWrapper: React.FC<{ shareCode: string }> = ({ shareCode }) => {
  const { user, authenticated } = usePrivy();
  
  return (
    <JoinMarriage 
      user={user as UserType || { wallet: undefined }}
      authenticated={authenticated}
    />
  );
};

function App() {
  const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
  const [mounted, setMounted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!PRIVY_APP_ID) {
      setError("Invalid Privy App ID configuration");
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (error) return <div>Error: {error}</div>;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet"],
        defaultChain: base,
        appearance: {
          theme: "light",
          accentColor: "#ec4899",
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<MarriageCertificateDapp />} />
            <Route 
              path="/join-marriage/:shareCode" 
              element={<JoinMarriageWrapper shareCode="" />} 
            />
            <Route path="*" element={<div>404 - Not Found. Current path: {window.location.pathname}</div>} />
            {/* Add other routes as needed */}
          </Routes>
        </div>
      </ThemeProvider>
    </PrivyProvider>
  );
}

export default App;