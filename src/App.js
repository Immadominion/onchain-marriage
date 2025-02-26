import { jsx as _jsx } from "react/jsx-runtime";
import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";
import MarriageCertificateDapp from "./components/MarriageCertificateDapp";
import { ThemeProvider } from "next-themes";
const appId = import.meta.env.VITE_PRIVY_APP_ID || "";

function App() {
    return (_jsx(PrivyProvider, { appId: appId, config: {
            loginMethods: ["wallet"],
            defaultChain: base,
            appearance: {
                theme: "light",
                accentColor: "#ec4899",
            },
        }, children: _jsx(ThemeProvider, { attribute: "class", children: _jsx(MarriageCertificateDapp, {}) }) }));
}
export default App;
