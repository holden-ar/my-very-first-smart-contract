const Nft4Auctions = artifacts.require("./contracts/Nft4Auctions.sol");
const SubastaNft = artifacts.require("./contracts/SubastaNft.sol");

module.exports = async function(callback) {
    let nft = await Nft4Auctions.deployed();
    let subasta = await SubastaNft.deployed();

    console.log("Address del Nft: ", nft.address)
    console.log("Address de la Subasta: ", subasta.address)

    let owner = "0x9A9DD901f8DE71F3e5BA38B92DE58b11a448FAaA";


    let ow = await nft.ownerOf(1);
    console.log("El owner del NFT es: ", ow);


    ow = await nft.balanceOf(owner)
    console.log("Balance NFT del owner: ", ow.toString(20));

     
     approved = await nft.getApproved(1)
     console.log("Approved for token 1: ", approved.toString(20));

    let url = await nft.tokenURI(1)
    console.log(url)

    let accounts = await web3.eth.getAccounts()
    console.log("cuenta #!", accounts[0]);
     
}