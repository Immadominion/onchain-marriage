interface NavbarProps {
    authenticated: boolean;
    user: {
        wallet?: {
            address?: string;
        };
    } | null;
    onLogin: () => void;
    onLogout: () => void;
}
declare const Navbar: React.FC<NavbarProps>;
export default Navbar;
