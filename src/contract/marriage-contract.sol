// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MarriageCertificate is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;
    uint256 public constant MINT_FEE = 0.005 ether;
    uint256 public constant BURN_FEE = 0.015 ether; // ~$25 equivalent in ETH
    
    mapping(uint256 => address) public partners;
    mapping(address => uint256) public marriages;
    mapping(uint256 => bool) public partnerMinted;
    mapping(uint256 => bool) public hasBeenBurned;

    event MarriageCertificateMinted(
        address indexed partner1,
        address indexed partner2,
        uint256 tokenId
    );

    event MarriageCertificateBurned(
        address indexed burner,
        uint256 tokenId,
        uint256 burnTimestamp
    );

    constructor() ERC721("Eternal Bond", "LOVE") Ownable(msg.sender) {}

    // Override _beforeTokenTransfer to implement non-transferable logic
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual  {
        // Allow minting and burning, but prevent transfers
        require(
            from == address(0) || to == address(0),
            "Marriage certificates are non-transferable"
        );
    }

    function mintMarriageCertificate(address partnerAddress) public payable {
        require(marriages[msg.sender] == 0, "Already married");
        require(marriages[partnerAddress] == 0, "Partner already married");
        require(msg.sender != partnerAddress, "Cannot marry yourself");
        require(msg.value >= MINT_FEE, "Insufficient minting fee");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);

        partners[newTokenId] = partnerAddress;
        marriages[msg.sender] = newTokenId;
        marriages[partnerAddress] = newTokenId;

        emit MarriageCertificateMinted(msg.sender, partnerAddress, newTokenId);
    }

    function partnerMint(uint256 tokenId) public {
        require(partners[tokenId] == msg.sender, "Not the partner");
        require(!partnerMinted[tokenId], "Partner already minted");
        require(!hasBeenBurned[tokenId], "Certificate has been burned");

        _safeMint(msg.sender, tokenId);
        partnerMinted[tokenId] = true;
    }

    function burnCertificate(uint256 tokenId) public payable {
        require(msg.value >= BURN_FEE, "Insufficient burn fee");
        require(
            ownerOf(tokenId) == msg.sender || partners[tokenId] == msg.sender,
            "Only partners can burn the certificate"
        );
        require(!hasBeenBurned[tokenId], "Certificate already burned");

        // Mark the certificate as burned
        hasBeenBurned[tokenId] = true;

        // Clear the marriage status for both partners
        address partner1 = ownerOf(tokenId);
        address partner2 = partners[tokenId];
        marriages[partner1] = 0;
        marriages[partner2] = 0;

        // Burn the token
        _burn(tokenId);
        
        emit MarriageCertificateBurned(msg.sender, tokenId, block.timestamp);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        // This will revert if the token doesn't exist
        ownerOf(tokenId);
        require(!hasBeenBurned[tokenId], "Certificate has been burned");

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Marriage Certificate #',
                        Strings.toString(tokenId),
                        '", "description": "This non-transferable NFT certifies the marriage between two addresses on the Base testnet.", ',
                        '"image": "data:image/svg+xml;base64,',
                        generateCertificateImage(tokenId),
                        '", "attributes": [{"trait_type": "Partner 1", "value": "',
                        Strings.toHexString(ownerOf(tokenId)),
                        '"}, {"trait_type": "Partner 2", "value": "',
                        Strings.toHexString(partners[tokenId]),
                        '"}, {"trait_type": "Soulbound", "value": "Yes"}]}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateCertificateImage(uint256 tokenId)
        internal
        view
        returns (string memory)
    {
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">',
                '<rect width="800" height="600" fill="#fff"/>',
                '<path d="M0 0h800v600H0z" fill="#fdf2f8"/>',
                '<text x="400" y="100" text-anchor="middle" font-size="40" fill="#ec4899">Marriage Certificate</text>',
                '<text x="400" y="150" text-anchor="middle" font-size="20" fill="#666">(Base Testnet)</text>',
                '<text x="400" y="200" text-anchor="middle" font-size="20">This certifies the marriage between</text>',
                '<text x="400" y="250" text-anchor="middle" font-size="16">',
                Strings.toHexString(ownerOf(tokenId)),
                '</text>',
                '<text x="400" y="300" text-anchor="middle" font-size="20">and</text>',
                '<text x="400" y="350" text-anchor="middle" font-size="16">',
                Strings.toHexString(partners[tokenId]),
                '</text>',
                '<text x="400" y="450" text-anchor="middle" font-size="16">Token ID: ',
                Strings.toString(tokenId),
                '</text>',
                '</svg>'
            )
        );

        return Base64.encode(bytes(svg));
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    receive() external payable {}
}