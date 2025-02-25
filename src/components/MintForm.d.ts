import React from "react";
interface MintFormProps {
    authenticated: boolean;
    user: {
        wallet?: {
            address: string;
        };
    };
}
declare const MintForm: React.FC<MintFormProps>;
export default MintForm;
