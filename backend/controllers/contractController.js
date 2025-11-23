const { ethers } = require("ethers");
const abi = require("../../artifacts/contracts/EHRContract.sol/EHRContract.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, abi, wallet);

// -------------------- REGISTRATION ----------------------

exports.registerPatient = async (req, res) => {
  try {
    const { privateKey, name } = req.body;

    const signer = new ethers.Wallet(privateKey, provider);
    const signedContract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await signedContract.registerPatient(name);
    await tx.wait();

    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const { privateKey, name } = req.body;

    const signer = new ethers.Wallet(privateKey, provider);
    const signedContract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await signedContract.registerDoctor(name);
    await tx.wait();

    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- ACCESS CONTROL ----------------------

exports.grantAccess = async (req, res) => {
  try {
    const { patientPrivateKey, doctorAddress } = req.body;

    const signer = new ethers.Wallet(patientPrivateKey, provider);
    const signed = new ethers.Contract(contractAddress, abi, signer);

    const tx = await signed.grantAccess(doctorAddress);
    await tx.wait();

    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const { patientPrivateKey, doctorAddress } = req.body;

    const signer = new ethers.Wallet(patientPrivateKey, provider);
    const signed = new ethers.Contract(contractAddress, abi, signer);

    const tx = await signed.revokeAccess(doctorAddress);
    await tx.wait();

    res.json({ success: true, tx: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- RECORDS ---------------------------

exports.addRecord = async (req, res) => {
  try {
    const { doctorPrivateKey, patientAddress, ipfsHash } = req.body;

    const signer = new ethers.Wallet(doctorPrivateKey, provider);
    const signed = new ethers.Contract(contractAddress, abi, signer);

    const tx = await signed.addRecord(patientAddress, ipfsHash);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecord = async (req, res) => {
  try {
    const r = await contract.getRecord(req.params.id);

    const record = {
      patient: r.patient,
      diagnosis: r.diagnosis,
      treatment: r.treatment,
      doctor: r.doctor,
      timestamp: r.timestamp.toString() // BigInt → string
    };

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecordsByPatient = async (req, res) => {
  try {
    const ids = await contract.getRecordsByPatient(req.params.patient);
    res.json({ records: ids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


