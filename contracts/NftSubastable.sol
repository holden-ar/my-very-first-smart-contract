// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/*
* Subasta v1.0
* Sistema de subastas para aprender Smart Contracts con Solidity
* By @hv4ld3z
* Este contrato permite crear un NFT 
*/

contract NftSubastable is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashes;


    constructor() ERC721("NftSubastable", "NFTSub") {  }

    function CrearNFT(address owner, string memory hash, string memory metadata) public  onlyOwner returns (uint256)
    {
        require(hashes[hash] != 1, "Ese NFT ya existe!");
        hashes[hash] = 1;
        _tokenIds.increment();
        uint256 nuevoItemId = _tokenIds.current();
        _safeMint(owner, nuevoItemId);
        _setTokenURI(nuevoItemId, metadata);
        return nuevoItemId;
    }
    
    
    // Solidity obliga a sobre-escribir estas funciones.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view  override(ERC721, ERC721URIStorage)  returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}