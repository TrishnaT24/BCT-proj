const { ethers } = require("ethers");
const abi = require("../../artifacts/contracts/EHRContract.sol/EHRContract.json").abi;

// NOTE: Ensure your .env variables are correctly set for RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS.
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

// -------------------- ACCESS ----------------------------

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
    // Get id and doctorAddress from the POST body
    const { id, doctorAddress } = req.body;

    if (!id || !doctorAddress) {
      return res.status(400).json({ error: "Record ID and Doctor address are required." });
    }
    
    // 1. Check if the Doctor is registered
    const isRegistered = await contract.isDoctorRegistered(doctorAddress);
    if (!isRegistered) {
      // 403 Forbidden is the correct status code for unauthorized access
      return res.status(403).json({ error: "Access Denied: The provided address is not registered as a doctor." });
    }

    // 2. Fetch the record
    // Ethers should handle the string 'id' conversion to uint256
    const r = await contract.getRecord(id);

    // 3. Check for record existence: In Solidity, if a struct in a mapping is uninitialized,
    // its fields are zeroed. Since record IDs start at 1, an ID of 0 means it does not exist.
    if (r.id === 0n) {
        return res.status(404).json({ error: `Record with ID ${id} not found.` });
    }

    // Convert BigInts to string for JSON serialization
    const record = {
      ID: r.id.toString(),
      Patient: r.patient,
      Doctor: r.doctor,
      'Data Hash (IPFS)': r.dataHash,
      Timestamp: r.timestamp.toString(),
    };

    res.json(record);
  } catch (err) {
    // Check if the error is a specific Ethers-related revert
    console.error("Error in getRecord:", err);
    // Returning the error message from the Ethers error if possible
    res.status(500).json({ 
        error: err.reason || err.message || "An unknown error occurred while fetching the record." 
    });
  }
};

exports.getRecordsByPatient = async (req, res) => {
  try {
    const patientAddress = req.params.patient;

    const recordIdsBigInt = await contract.getRecordsByPatient(patientAddress);
    
    // Map the array of BigInts to an array of Strings 
    const recordIds = recordIdsBigInt.map(id => id.toString()); 

    res.json(recordIds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};