async function main() {
const [deployer] = await ethers.getSigners();
console.log('Deploying with', deployer.address);


const EHR = await ethers.getContractFactory('EHRContract');
const ehr = await EHR.deploy();
await ehr.waitForDeployment();


console.log('EHRContract deployed to:', ehr.target);
}


main().catch((error) => {
console.error(error);
process.exitCode = 1;
});
