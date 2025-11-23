// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EHRContract {
    
    // -------------------------
    // STRUCTS
    // -------------------------
    struct Patient {
        string name;
        bool exists;
    }

    struct Doctor {
        string name;
        bool exists;
    }

    struct Record {
        uint256 id;
        string dataHash;
        address patient;
        address doctor;
        uint256 timestamp;
    }

    // -------------------------
    // STORAGE
    // -------------------------
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(uint256 => Record) public records;

    uint256 public recordCount;

    // Access control: patient -> doctor -> allowed?
    mapping(address => mapping(address => bool)) public accessGranted;

    // -------------------------
    // EVENTS
    // -------------------------
    event PatientRegistered(address indexed patient, string name);
    event DoctorRegistered(address indexed doctor, string name);
    event RecordCreated(uint256 indexed id, address indexed patient, address doctor);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    // -------------------------
    // REGISTRATION
    // -------------------------

    function registerPatient(string memory name) external {
        require(!patients[msg.sender].exists, "Patient already registered");

        patients[msg.sender] = Patient({
            name: name,
            exists: true
        });

        emit PatientRegistered(msg.sender, name);
    }

    function registerDoctor(string memory name) external {
        require(!doctors[msg.sender].exists, "Doctor already registered");

        doctors[msg.sender] = Doctor({
            name: name,
            exists: true
        });

        emit DoctorRegistered(msg.sender, name);
    }

    // -------------------------
    // ACCESS CONTROL
    // -------------------------
    function grantAccess(address doctor) external {
        require(patients[msg.sender].exists, "Only patients can grant access");
        require(doctors[doctor].exists, "Doctor not registered");

        accessGranted[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    function revokeAccess(address doctor) external {
        require(patients[msg.sender].exists, "Only patients can revoke access");
        require(accessGranted[msg.sender][doctor], "Access not granted");

        accessGranted[msg.sender][doctor] = false;
        emit AccessRevoked(msg.sender, doctor);
    }

    // -------------------------
    // ADD MEDICAL RECORD
    // -------------------------
    function addRecord(address patient, string memory dataHash) external {
        require(doctors[msg.sender].exists, "Only registered doctor can add record");
        require(patients[patient].exists, "Patient not registered");
        require(accessGranted[patient][msg.sender], "Doctor does not have access");

        recordCount++;
        records[recordCount] = Record({
            id: recordCount,
            dataHash: dataHash,
            patient: patient,
            doctor: msg.sender,
            timestamp: block.timestamp
        });

        emit RecordCreated(recordCount, patient, msg.sender);
    }

    // -------------------------
    // VIEW RECORD
    // -------------------------
    function getRecord(uint256 id) external view returns (Record memory) {
        return records[id];
    }

    function getRecordsByPatient(address patient) external view returns (uint256[] memory) {
        uint256 count;

        for (uint256 i = 1; i <= recordCount; i++) {
            if (records[i].patient == patient) count++;
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx;

        for (uint256 i = 1; i <= recordCount; i++) {
            if (records[i].patient == patient) {
                result[idx++] = i;
            }
        }

        return result;
    }
}
