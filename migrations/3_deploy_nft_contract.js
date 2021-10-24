var NftSubastable = artifacts.require("NftSubastable");

module.exports = async function(deployer) {
  await deployer.deploy(NftSubastable);
};
