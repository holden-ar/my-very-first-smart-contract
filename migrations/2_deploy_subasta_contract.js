var Subasta = artifacts.require("Subasta");

module.exports = async function(deployer) {
   await deployer.deploy(Subasta, 30, "NftLegendario");
};