var SubastaNft = artifacts.require("SubastaNft");

module.exports = async function(deployer) {
   await deployer.deploy(SubastaNft);
};