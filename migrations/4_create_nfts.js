const Nft4Auctions = artifacts.require("./contracts/Nft4Auctions.sol");


module.exports = async function(callback) {
    // Contrato del NFT
    let nft = await Nft4Auctions.deployed()
    console.log("Creando NFTs para el contranto: ", nft.address, "...")

    // Owner
    let accounts = await web3.eth.getAccounts()
    let owner1 = accounts[0]
    let owner2 = accounts[1]
    console.log("Owner #1: ", owner1)
    console.log("Owner #2: ", owner2)

    //Creo el NFT #1
    await nft.CreateNFT(owner1, 
        "QmWT7tURY9zL2w4q1W76TUBQcDjUcHz7ZeE5XKBpCUA22w", 
        "ipfs://QmVmBtxbnpyksLS9nTgJHNpzejA6YCKcyySAJ37QPD5Toc")
    .then((response) => {
        console.log("Nft #1 creado");
    });
        

    //Creo el NFT #2
    await nft.CreateNFT(owner1, 
        "QmQrQiMgEm4eYQ6BReD76tzENytskcVn64NZqAoJKkbpLx", 
        "ipfs://QmZQEdC23Jex5NcNUxTUSxkFbJDUiKM5uccrA4cvmRqEiM")
    .then((response) => {
        console.log("Nft #2 creado");
    });

    //Creo el NFT #3
    await nft.CreateNFT(owner1, 
        "QmfLzU9cZXmQEBD6c6jdLKY6fWbXnbYe9cJiUmAot5duQu", 
        "ipfs://QmeBMTZkTUTPakcRSDeWAVs1EzC5TZ4bhcxTzXFsrkFLb2")
    .then((response) => {
        console.log("Nft #3 creado");
    });

    //Creo el NFT #4
    await nft.CreateNFT(owner1, 
        "QmSdAUGBZxswMM9adv4r3dmxTsK2pLY6P9i3zzcngHhGhr", 
        "ipfs://QmRdXM4Huk6haco9GXo2GV1xCKzuWixuRjUoeiDpfjEams")
    .then((response) => {
        console.log("Nft #4 creado");
    });

    //Creo el NFT #5
    await nft.CreateNFT(owner2, 
        "QmZ8oaHRpiB3LbvaxNHsrCeCZK61QXeCJzryJoMjH3mPtv", 
        "ipfs://QmUckZbQ4TWf4UxKSMdUx7ndckJ8dUVGJmdrrLHtDsL5Fw")
    .then((response) => {
        console.log("Nft #5 creado");
    });
}