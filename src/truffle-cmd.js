

let nft = await Nft4Auctions.deployed()
let newNft = await nft.CreateNFT("0x61A1BdcF6947A0DB5052796BfFc2B09b742511e2", "QmWT7tURY9zL2w4q1W76TUBQcDjUcHz7ZeE5XKBpCUA22w", "ipfx://QmVmBtxbnpyksLS9nTgJHNpzejA6YCKcyySAJ37QPD5Toc")
let owner = await nft.ownerOf(1)





let subasta = await Subasta.deployed()
let auction = await subasta.createAuction("0x1Eaeef0c68707aE6edbDD5E6855E0a4ab5Edb35F", 1)