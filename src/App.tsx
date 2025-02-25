import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";
import MarriageCertificateDapp from "./components/MarriageCertificateDapp";
import { ThemeProvider } from "next-themes";

const appId = process.env.VITE_PRIVY_APP_ID || "";

function App() {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["wallet"],
        defaultChain: base,
        appearance: {
          theme: "light",
          accentColor: "#ec4899",
        },
      }}
    >
      <ThemeProvider attribute="class">
        <MarriageCertificateDapp />
      </ThemeProvider>
    </PrivyProvider>
  );
}

export default App;
