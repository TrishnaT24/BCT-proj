const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EHRContract", function () {
  let ehr;
  let owner, doctor, patient;

  beforeEach(async function () {
    [owner, doctor, patient] = await ethers.getSigners();

    const EHR = await ethers.getContractFactory("EHRContract");
    ehr = await EHR.deploy();
    await ehr.waitForDeployment();
  });

  it("registers a record", async function () {
    await ehr.connect(doctor).addRecord("HASH123", patient.address);

    const rec = await ehr.records(1);

    expect(rec.recordId).to.equal(1);
    expect(rec.patient).to.equal(patient.address);
    expect(rec.doctor).to.equal(doctor.address);
  });
});
