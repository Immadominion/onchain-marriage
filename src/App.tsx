import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";
import MarriageCertificateDapp from "./components/MarriageCertificateDapp";
import { ThemeProvider } from "next-themes";
import React from "react";

function App() {
  const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
  console.log(PRIVY_APP_ID);
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
          <MarriageCertificateDapp />
        </div>
      </ThemeProvider>
    </PrivyProvider>
  );
}

export default App;
