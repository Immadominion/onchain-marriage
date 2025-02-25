"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_auth_1 = require("@privy-io/react-auth");
const chains_1 = require("viem/chains");
const MarriageCertificateDapp_1 = __importDefault(require("./components/MarriageCertificateDapp"));
const next_themes_1 = require("next-themes");
const appId = import.meta.env.VITE_PRIVY_APP_ID || "";
function App() {
    return ((0, jsx_runtime_1.jsx)(react_auth_1.PrivyProvider, { appId: appId, config: {
            loginMethods: ["wallet"],
            defaultChain: chains_1.base,
            appearance: {
                theme: "light",
                accentColor: "#ec4899",
            },
        }, children: (0, jsx_runtime_1.jsx)(next_themes_1.ThemeProvider, { attribute: "class", children: (0, jsx_runtime_1.jsx)(MarriageCertificateDapp_1.default, {}) }) }));
}
exports.default = App;
