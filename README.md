# Smart Contracts en Solidity

Proyecto realizado en solidity que tiene por objetivo aplicar los (humildes) conocimientos para smart contracts que adquirí en el curso del [Programando Smart Contracts y billeteras virtuales](https://mug-it.org.ar/577-Programando-Smart-Contracts-y-Billeteras-Virtuales.event.aspx).



## Qué se necesita para usarlo?

Para probar los contratos solo se necesita remix y tener instalado truffle. 
Para poder probar la DApp se necesita tener instalado MetaMask, Ganache y haber importado las 2 primeras cuentas de Ganache en Metamask.



## Cómo se instala?
Los pasos acá enumerados son para instalar los contratos y ejecutar la DApp

- Clonar este repo
- Iniciar Ganache
- Instalacion de Smart Contracts
    - En una consola esscribir los siguiente scomandos de truffle:
        - truffle console
        - una vez que nos devuelve el prompt escribimos *build* para compilar los contratos 
        - Luego escribimos *migrate* para desplegarlos sobre ganache (que debe estár ejecutandose previamente)
- Instalación de la DApp
    - Abrimos una nueva terminal para instalar las dependencias, para ello escribimos *npm install*
    - Luego que  escribir *npm run dev* con esto se inicia lite server y abre la DApp en el explorador


## Connect Wallet
<img src="readme-files/login.gif" alt="contrato" title="contracto" align="center" />


## Cambio de cuenta reactivo

<img src="readme-files/change-user.gif" alt="contrato" title="contracto" align="center" />



## Subastar
Enviar al contrato SubastaNtf.sol un token que tiene en su billetera para poder subastarlo. 


*Notar que la primer operación es autorizar al contrato para usar el ntf y la segunda autorizar la transferencia del ntfs al contrato*

<img src="readme-files/create-auction.gif" alt="contrato" title="contracto" align="center" />

## Cancelar subasta
El usuario le solicita al contrato SubastaNtf.sol cancelar la subasta.

*Notar que luego de cancelada la subasta el nft regresa a la billetera del usuario*

<img src="readme-files/cancel-auction.gif" alt="contrato" title="contracto" align="center" />

## Disconnect Wallet
<img src="readme-files/logout.gif" alt="contrato" title="contracto" align="center" />


## Workflow
*pendiente la parte de ofertas*
<img src="https://gateway.pinata.cloud/ipfs/QmfTMYn9hmhqoaio8sSyfqcpJaMxGm6Fy8Fm8NDgCTcCJq" alt="contrato" title="contracto" align="center" height="600" />

## Herramientas

Este es un listado de las herramientas, frameworks y demas yerbas que usé para probar todo esto.


- [Truffel](https://www.trufflesuite.com)
- [Ganache](https://www.trufflesuite.com/ganache)
- [Metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=es)
- [Pinata](https://pinata.cloud/)
