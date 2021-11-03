var Nft4Auctions = artifacts.require("Nft4Auctions");

module.exports = async function(deployer) {
  await deployer.deploy(Nft4Auctions).then(() => Nft4Auctions.deployed())
  .then((instance) => {
      instance.CreateNFT(
        "0x5c113915b9408984ED259BF561A124D7aBF4C366",
        "QmWT7tURY9zL2w4q1W76TUBQcDjUcHz7ZeE5XKBpCUA22w",
        "ipfx://QmVmBtxbnpyksLS9nTgJHNpzejA6YCKcyySAJ37QPD5Toc"
      );
  });
};
