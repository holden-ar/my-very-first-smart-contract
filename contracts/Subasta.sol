// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

/*
* Subasta v1.0
* Sistema de subastas para aprender Smart Contracts con Solidity
* By @hv4ld3z
* Este contrato permite simular una subasta
*/
abstract contract SubastaBase {
    string public version = "1.0.2";
    address internal subasta_owner;
    uint256 public subasta_inicio;
    uint256 public subasta_finaliza;
    uint256 public ofertaGanadora;
    address public oferenteGanador;
    
    enum estado { CANCELADA, INICIADA }
    
    struct articulo {
        string Nombre; 
    }

    articulo public miNft; 

    address[] oferentes;
    mapping(address => uint) public ofertas; 
    estado public Estado;

    modifier subasta_en_curso() { 
        require(block.timestamp <= subasta_finaliza && Estado == estado.INICIADA, "La subasta no esta en curso");
        _;
    }
    
    modifier solo_owner() { 
        require(msg.sender == subasta_owner,  "Solo el owner puede finalizar la subasta");
        _;
    }

   
    event OfertaRealizadaEvent(address indexed oferenteGanador, uint256 ofertaGanadora); 
    event RetiroRealizadoEvent(address solicitante, uint256 monto);
    event SubastaCanceladaEvent(string mensaje, uint256 hora);
    
    constructor(uint  _duracion,  string memory  _articulo) {
        subasta_owner = msg.sender; 
        Estado = estado.INICIADA;
        miNft.Nombre = _articulo;
        subasta_inicio = block.timestamp;
        subasta_finaliza = subasta_inicio + _duracion;
        
        console.log("subasta_inicio", subasta_inicio);
        console.log("subasta_finaliza", subasta_finaliza);

    }
    
    function ofertar() public virtual payable returns (bool);
    function retirar() public virtual returns (bool);
    function cancelarSubasta() public virtual returns (bool);
}

contract Subasta is SubastaBase {
    
    constructor(uint  _duracion,  string memory  _articulo) SubastaBase(_duracion, _articulo)  {}

    function ofertar() public virtual override payable subasta_en_curso returns (bool){ 
        require(msg.value > 0, "La oferta no puede ser 0.");
        require(ofertas[msg.sender] + msg.value > ofertaGanadora, "No se puede ofertar, debe realizar una oferta mas alta");
        oferenteGanador = msg.sender; 
        ofertaGanadora = msg.value; 
        oferentes.push(msg.sender);
        ofertas[msg.sender] = ofertas[msg.sender] + msg.value; emit OfertaRealizadaEvent(oferenteGanador, ofertaGanadora);
        emit OfertaRealizadaEvent(oferenteGanador, ofertaGanadora); 
        return true;
    }
    
    function cancelarSubasta() public virtual override  solo_owner returns (bool) {
        Estado = estado.CANCELADA;
        emit SubastaCanceladaEvent("Subasta Cancelada", block.timestamp);
        return true;
    }
    
    function retirar() public virtual override returns (bool) {
        require(block.timestamp > subasta_finaliza, "No se puede retirar, la subasta aun esta en curso."); 
        require(msg.sender != oferenteGanador, "Uds ha ganado la subasta, no puede retirar su dinero."); 
        
        uint monto = ofertas[msg.sender];
        ofertas[msg.sender] = 0;
        payable(msg.sender).transfer(monto); 
        emit RetiroRealizadoEvent(msg.sender, monto);
        return true;
    }

    function EliminarSubasta() external solo_owner returns (bool) { 
        require(block.timestamp  > subasta_finaliza || Estado == estado.CANCELADA, "No se puede destruir el contrato, la subasta esta activa");
        for (uint i = 0; i < oferentes.length; i++)
        {
            assert(ofertas[oferentes[i]] == 0);
        }
        address payable devolverAlOwner = payable(subasta_owner);
        selfdestruct(devolverAlOwner); 
        return true;
    }
 }
