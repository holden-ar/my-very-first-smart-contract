// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Nft4Auctions is ERC721, ERC721URIStorage, Pausable, Ownable {
    using Counters for Counters.Counter;
    mapping(string => uint8) private hashes;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Nft4Acutions", "NFT4A") {}
    
    event NftCreated(uint256 id, address owner);

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    
    /// This method allows to create a new nft
    /// @param owner is the recipient address
    /// @param hash is the asset' hash
    /// @param metadata is the metadata URL: Metadata should be in the following format 
     function CreateNFT(address owner, string memory hash, string memory metadata) 
        public  
        onlyOwner 
        whenNotPaused 
        returns (uint256)
    {
        require(hashes[hash] != 1, "This NFT Id alerady exist!");
        hashes[hash] = 1;
        _tokenIdCounter.increment();
        uint256 newId = _tokenIdCounter.current();
        _safeMint(owner, newId);
        _setTokenURI(newId, metadata);
        
        emit NftCreated(newId, owner);
        
        return newId;
    }
    

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
     // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
