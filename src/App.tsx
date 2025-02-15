import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";
import MarriageCertificateDapp from "./components/MarriageCertificateDapp";

function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID!}
      config={{
        loginMethods: ["wallet"],
        defaultChain: base,
        appearance: {
          theme: "light",
          accentColor: "#ec4899",
        },
      }}
    >
      <MarriageCertificateDapp />
    </PrivyProvider>
  );
}

export default App;