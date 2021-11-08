// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


/*
* Subasta v2.0
* Sistema de subastas para aprender Smart Contracts con Solidity
* By @hv4ld3z
* Es un homenaje al contracto del Market de Axie Infinity
* https://github.com/axieinfinity/public-smart-contracts/blob/master/contracts/marketplace/AxieClockAuction.sol
*/
contract SubastaNft is Pausable, Ownable {
    
    string version = "1.0.1r";
    
    // Representa una subasta del NFT
    struct Subasta {
        address vendedor;
        uint256 duracion;
        uint64 fechaInicio;
        uint64 fechaFin;
        uint128 oferta;
        address ganador;
        Estado estado;
    }
    
    // Map from token ID to their corresponding auction.
    // subastaInfo = subastas[contract][counter]
    mapping (address => mapping (uint256 => Subasta)) public subastas;
    
    // Representa los estados de una subasta
    enum Estado { INICIADA, FINALIZADA, CANCELADA }

    
    function crearSubasta(address _nftAddress, uint256 _tokenId, uint256 _duracion) 
    external payable
    whenNotPaused 
    {
        // vendedor
        address _vendedor = msg.sender;
        
        // Valida que el vendedor sea el owner del NTF
        require(_owns(_nftAddress, _vendedor, _tokenId),"Ese NFT no es tuyo");
        
        // cambia el owner del NFT para que sea el contrato
        _escrow(_nftAddress, _vendedor, _tokenId);
        
        // genero una subasta
        Subasta memory _subasta = Subasta(
          _vendedor,
          _duracion,
          uint64(block.timestamp),
          uint64(0),
          uint128(0),
          address(0),
          Estado.INICIADA
        );
        
        
        _addAuction(
          _nftAddress,
          _tokenId,
          _subasta,
          _vendedor
        );
        
        
        console.log("Seller ", _vendedor);
    }
    
    
    function cancelarSubasta(address _nftAddress, uint256 _tokenId) external 
    whenNotPaused 
    {
        address _vendedor = msg.sender;
        Subasta storage _subasta = subastas[_nftAddress][_tokenId];
        _subasta.estado = Estado.CANCELADA;
        subastas[_nftAddress][_tokenId] = _subasta;
        
        require(_vendedor == _subasta.vendedor, "Solo el vendedor pueda cancelar la subasta");
        
        // Transfiere al vendedor el token
        _transfer(_nftAddress,_vendedor, _tokenId);
        
        // Broadcast
        emit SubastaCanceladaEvent(_nftAddress, _tokenId, _vendedor);
    }
    
    
    
    event SubastaCreada(address indexed _nftAddress,uint256 indexed _tokenId,uint256 _duracion,address _vendedor);
    event SubastaCanceladaEvent(address indexed _nftAddress,uint256 indexed _tokenId, address _vendedor);
    
    event OfertaRealizadaEvent(address indexed oferenteGanador, uint256 ofertaGanadora); 
    event RetiroRealizadoEvent(address solicitante, uint256 monto);
    
   
    
    
    
    

    //// @dev Returns true if the claimant owns the token.
    /// @param _nftAddress - The address of the NFT.
    /// @param _claimant - Address claiming to own the token.
    /// @param _tokenId - ID of token whose ownership to verify.
    function _owns(address _nftAddress, address _claimant, uint256 _tokenId) internal view returns (bool) {
         IERC721 _nftContract = _getNftContract(_nftAddress);
         return (_nftContract.ownerOf(_tokenId) == _claimant);
    }
    
    /// @dev Gets the NFT object from an address, validating that implementsERC721 is true.
    /// @param _nftAddress - Address of the NFT.
    function _getNftContract(address _nftAddress) internal pure returns (IERC721) {
        IERC721 candidateContract = IERC721(_nftAddress);
        return candidateContract;
    }
    
    /// @dev Escrows the NFT, assigning ownership to this contract.
    /// Throws if the escrow fails.
    /// @param _nftAddress - The address of the NFT.
    /// @param _owner - Current owner address of token to escrow.
    /// @param _tokenId - ID of token whose approval to verify.
    function _escrow(address _nftAddress, address _owner, uint256 _tokenId) internal {
        IERC721 _nftContract = _getNftContract(_nftAddress);
        
        // It will throw if transfer fails
        _nftContract.transferFrom(_owner, address(this), _tokenId);
    }
    
    /// @dev Adds an auction to the list of open auctions. Also fires the
    ///  AuctionCreated event.
    /// @param _tokenId The ID of the token to be put on auction.
    /// @param _auction Auction to add.
    function _addAuction(
        address _nftAddress,
        uint256 _tokenId,
        Subasta memory _auction,
        address _seller
    )
        internal
    {
        // Require that all auctions have a duration of
        // at least one minute. (Keeps our math from getting hairy!)
        require(_auction.duracion >= 1 minutes);
        
        subastas[_nftAddress][_tokenId] = _auction;
        
        emit SubastaCreada(
            _nftAddress,
            _tokenId,
            uint256(_auction.duracion),
            _seller
        );
    }
    
    /// @dev Transfers an NFT owned by this contract to another address.
    /// Returns true if the transfer succeeds.
    /// @param _nftAddress - The address of the NFT.
    /// @param _receiver - Address to transfer NFT to.
    /// @param _tokenId - ID of token to transfer.
    function _transfer(address _nftAddress, address _receiver, uint256 _tokenId) internal {
        IERC721 _nftContract = _getNftContract(_nftAddress);
        
        // It will throw if transfer fails
        _nftContract.transferFrom(address(this), _receiver, _tokenId);
    }
 }
