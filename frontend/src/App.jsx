import React, { useState, useEffect, useCallback } from 'react';

// --- INLINE LUCIDE ICONS (To avoid 'lucide-react' dependency issue in single-file environment) ---

const Shield = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const User = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const Stethoscope = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v2l-5 5v4h4"/><path d="M19 4h2a2 2 0 0 1 2 2v3"/><path d="M19 9h2a2 2 0 0 1 2 2v3"/><path d="M11 14h10"/><path d="M21 17h-2"/><path d="M11 17h4a2 2 0 0 0 2-2v-4l-5-5V4a2 2 0 0 0-2-2"/></svg>);
const BriefcaseMedical = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11v-4"/><path d="M14 9h-4"/><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M8 20h8"/><path d="M6 19h12"/></svg>);
const Lock = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const Unlock = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 8-4M17 11V7a5 5 0 0 0-5-5"/></svg>);
const ClipboardCheck = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/><path d="m9 13 2 2 4-4"/></svg>);
const ArrowLeft = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>);
const Loader2 = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);

// NOTE: This URL must match the port your Express server is running on.
const SERVER_URL = 'http://localhost:4000'; 

// Utility function for fetching data with error handling
const safeFetch = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.indexOf("application/json") !== -1;
        
        let data = {};
        
        // CRITICAL FIX: Only attempt to parse JSON if the content type is JSON.
        if (isJson) {
            data = await response.json();
        } else if (!response.ok) {
            // Handle non-JSON server errors
            data = { error: `HTTP Error ${response.status}: Failed to connect or received non-JSON response.` };
        } else {
            // Assume success with no content if not JSON and not an error
            data = { success: true, message: "Operation completed successfully (No content)." };
        }
        
        if (!response.ok) {
            // Throw an error with the backend's message
            throw new Error(data.error || `Server responded with status ${response.status}`);
        }
        return data;

    } catch (error) {
        console.error("Fetch Error:", error);
        // The error message from the try block should be displayed to the user
        throw new Error(`Transaction Failed: ${error.message}`);
    }
};

// Base Component: User Card for key/address management
const UserCard = ({ role, address, privateKey }) => (
    <div className="p-4 bg-white/10 rounded-xl shadow-inner border border-white/20 mb-6">
        <div className="flex items-center text-sm font-semibold text-teal-200 mb-1">
            <Shield className="w-4 h-4 mr-2" />
            {role} Credentials (Simulation)
        </div>
        <div className="text-xs text-gray-300 truncate">
            <span className="font-mono font-medium text-white">Address:</span> {address || 'N/A'}
        </div>
        <div className="text-xs text-gray-300 truncate">
            <span className="font-mono font-medium text-white">Private Key:</span> {privateKey ? '**** (Inputted)' : 'N/A'}
        </div>
        <p className="mt-2 text-xs text-red-300 font-bold">
            NEVER use a real private key here. This is for local testing only!
        </p>
    </div>
);

// Main Application Component
const App = () => {
    const [view, setView] = useState('home'); // 'home', 'patient', 'doctor'
    const [status, setStatus] = useState({ message: '', type: '' }); // 'success', 'error', 'loading'
    const [isLoading, setIsLoading] = useState(false);

    // --- Patient State ---
    const [patientName, setPatientName] = useState('');
    const [patientAddress, setPatientAddress] = useState('');
    const [patientKey, setPatientKey] = useState('');
    const [grantRevokeDoctor, setGrantRevokeDoctor] = useState('');
    const [patientRecordIds, setPatientRecordIds] = useState([]);
    
    // --- Doctor State ---
    const [doctorName, setDoctorName] = useState('');
    const [doctorAddress, setDoctorAddress] = useState('');
    const [doctorKey, setDoctorKey] = useState('');
    const [recordPatientAddress, setRecordPatientAddress] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [viewRecordId, setViewRecordId] = useState('');
    // Doctor address for viewing records
    const [viewDoctorAddress, setViewDoctorAddress] = useState('');
    const [viewedRecord, setViewedRecord] = useState(null);

    // Helper to set and clear status messages
    const displayStatus = useCallback((message, type) => {
        setStatus({ message, type });
        const timer = setTimeout(() => setStatus({ message: '', type: '' }), 5000);
        return () => clearTimeout(timer);
    }, []);

    // -------------------- HANDLERS --------------------

    const handleRegistration = async (role) => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });
        
        const key = role === 'patient' ? patientKey : doctorKey;
        const name = role === 'patient' ? patientName : doctorName;
        
        if (!key || !name) {
            displayStatus('Please enter a Name and Private Key.', 'error');
            setIsLoading(false);
            return;
        }

        const url = `${SERVER_URL}/register/${role}`;
        
        try {
            await safeFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ privateKey: key, name })
            });
            displayStatus(`${role.toUpperCase()} Registered Successfully!`, 'success');
            
            const enteredAddress = window.prompt(`Registration successful for ${name}. In a real dApp, the address would be derived automatically. Please manually enter the ${role}'s public address linked to this key for display:`);
            
            if (role === 'patient') {
                setPatientAddress(enteredAddress || 'N/A');
            } else {
                setDoctorAddress(enteredAddress || 'N/A');
                // Auto-fill the viewDoctorAddress for convenience
                setViewDoctorAddress(enteredAddress || 'N/A'); 
            }


        } catch (error) {
            displayStatus(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccessControl = async (action) => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });

        if (!patientKey || !grantRevokeDoctor) {
            displayStatus('Patient Key and Doctor Address are required.', 'error');
            setIsLoading(false);
            return;
        }

        const url = `${SERVER_URL}/access/${action}`; // 'grant' or 'revoke'
        
        try {
            const result = await safeFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    patientPrivateKey: patientKey, 
                    doctorAddress: grantRevokeDoctor 
                })
            });
            displayStatus(`Access ${action === 'grant' ? 'Granted' : 'Revoked'} successfully! Tx: ${result.tx.substring(0, 10)}...`, 'success');
            setGrantRevokeDoctor('');

        } catch (error) {
            displayStatus(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRecord = async () => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });

        if (!doctorKey || !recordPatientAddress || !ipfsHash) {
            displayStatus('All fields (Doctor Key, Patient Address, IPFS Hash) are required.', 'error');
            setIsLoading(false);
            return;
        }

        const url = `${SERVER_URL}/record/add`;
        
        try {
            const result = await safeFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    doctorPrivateKey: doctorKey, 
                    patientAddress: recordPatientAddress, 
                    ipfsHash: ipfsHash 
                })
            });
            displayStatus(`Record Added! Tx Hash: ${result.txHash.substring(0, 10)}...`, 'success');
            setRecordPatientAddress('');
            setIpfsHash('');
        } catch (error) {
            displayStatus(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetRecordsByPatient = async () => {
        setIsLoading(true);
        setPatientRecordIds([]);
        setStatus({ message: '', type: '' });

        if (!patientAddress) {
            displayStatus('Please provide the Patient Address to look up records.', 'error');
            setIsLoading(false);
            return;
        }
        
        const url = `${SERVER_URL}/records/${patientAddress}`;
        
        try {
            const result = await safeFetch(url);
            
            // The backend controller returns an array of BigInt strings which are the IDs
            if (Array.isArray(result) && result.length > 0) {
                 // Convert BigInt strings to regular strings for display
                setPatientRecordIds(result.map(id => String(id))); 
                displayStatus(`Found ${result.length} record IDs.`, 'success');
            } else if (Array.isArray(result)) {
                setPatientRecordIds([]);
                displayStatus(`No records found for address ${patientAddress}.`, 'success');
            } else {
                 throw new Error("Invalid response format from backend.");
            }

        } catch (error) {
            displayStatus(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetRecord = async () => {
        setIsLoading(true);
        setViewedRecord(null);
        setStatus({ message: '', type: '' });
        
        if (!viewRecordId || !viewDoctorAddress) {
            displayStatus('Please enter a Record ID and your registered Doctor Address.', 'error');
            setIsLoading(false);
            return;
        }

        // Changed to POST and sending data in the body
        const url = `${SERVER_URL}/record/view`;
        
        try {
            const record = await safeFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: viewRecordId, 
                    doctorAddress: viewDoctorAddress 
                })
            });
            
            setViewedRecord(record);
            displayStatus(`Record #${viewRecordId} fetched successfully.`, 'success');
        } catch (error) {
            // Error handling will catch the 403 Forbidden or 404 Not Found errors from the backend check
            displayStatus(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };


    // -------------------- UI COMPONENTS --------------------

    const StatusMessage = ({ message, type }) => {
        if (!message) return null;
        const base = "p-3 rounded-xl mb-4 font-semibold shadow-md";
        let style = '';
        if (type === 'success') style = 'bg-green-600/70 text-white';
        if (type === 'error') style = 'bg-red-600/70 text-white';
        if (type === 'loading') style = 'bg-blue-500/70 text-white flex items-center';

        return (
            <div className={`${base} ${style}`}>
                {type === 'loading' && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {message}
            </div>
        );
    };

    const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
            />
        </div>
    );

    const Button = ({ onClick, children, className = '', disabled = false, icon: Icon, color = 'bg-teal-600' }) => (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`flex items-center justify-center px-6 py-3 font-semibold text-white rounded-xl shadow-lg transition duration-300 
                        ${color} hover:opacity-90 active:scale-[.98]
                        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        ${className}`}
        >
            {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {!isLoading && Icon && <Icon className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );

    const HomeView = () => (
        <div className="flex flex-col items-center space-y-8">
            <h1 className="text-4xl font-extrabold text-white mb-6">
                EHR Blockchain Portal
            </h1>
            <p className="text-gray-300 text-center max-w-lg">
                Select your role to interact with the Electronic Health Record smart contract via the secure Express server gateway.
            </p>

            <div className="flex space-x-6">
                <div 
                    onClick={() => setView('patient')} 
                    className="flex flex-col items-center p-8 bg-gray-800/80 rounded-2xl shadow-2xl hover:bg-teal-600/30 transition duration-300 cursor-pointer w-48 h-48 justify-center border-2 border-transparent hover:border-teal-400"
                >
                    <User className="w-12 h-12 text-teal-400 mb-3" />
                    <span className="text-xl font-bold text-white">Patient</span>
                    <p className="text-sm text-gray-400 text-center mt-1">Manage access & view records.</p>
                </div>
                <div 
                    onClick={() => setView('doctor')} 
                    className="flex flex-col items-center p-8 bg-gray-800/80 rounded-2xl shadow-2xl hover:bg-blue-600/30 transition duration-300 cursor-pointer w-48 h-48 justify-center border-2 border-transparent hover:border-blue-400"
                >
                    <Stethoscope className="w-12 h-12 text-blue-400 mb-3" />
                    <span className="text-xl font-bold text-white">Doctor</span>
                    <p className="text-sm text-gray-400 text-center mt-1">Register & add/view records.</p>
                </div>
            </div>
        </div>
    );

    const PatientView = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-teal-400 flex items-center">
                <User className="w-6 h-6 mr-3" /> Patient Portal
            </h2>
            <UserCard 
                role="Patient" 
                address={patientAddress} 
                privateKey={patientKey} 
            />
            
            <StatusMessage message={status.message} type={status.type} />
            
            {/* Registration */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-teal-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">1. Register</h3>
                <Input label="Patient Name" value={patientName} onChange={setPatientName} placeholder="E.g., Alice Smith" />
                <Input label="Private Key (Test Only)" value={patientKey} onChange={setPatientKey} type="password" placeholder="0x..." />
                <Input label="Public Address (For Display/Lookup)" value={patientAddress} onChange={setPatientAddress} placeholder="0x..." />
                <Button onClick={() => handleRegistration('patient')} icon={ClipboardCheck}>
                    Register Patient
                </Button>
            </div>

            {/* Access Control */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-teal-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">2. Manage Doctor Access</h3>
                <Input 
                    label="Doctor Address" 
                    value={grantRevokeDoctor} 
                    onChange={setGrantRevokeDoctor} 
                    placeholder="Doctor's 0x address" 
                />
                <div className="flex space-x-4">
                    <Button 
                        onClick={() => handleAccessControl('grant')} 
                        icon={Lock}
                        color="bg-green-600"
                        className="flex-1"
                    >
                        Grant Access
                    </Button>
                    <Button 
                        onClick={() => handleAccessControl('revoke')} 
                        icon={Unlock}
                        color="bg-red-600"
                        className="flex-1"
                    >
                        Revoke Access
                    </Button>
                </div>
            </div>

            {/* View Records */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-teal-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">3. View Your Records</h3>
                <p className="text-sm text-gray-400 mb-3">Enter your address above to look up all your record IDs. (Patient must be registered)</p>
                <Button 
                    onClick={handleGetRecordsByPatient} 
                    icon={BriefcaseMedical}
                    color="bg-purple-600"
                >
                    Fetch My Record IDs
                </Button>
                {patientRecordIds.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                        <p className="font-semibold text-white">Found Record IDs:</p>
                        <p className="text-teal-300 text-sm">{patientRecordIds.join(', ')}</p>
                    </div>
                )}
            </div>

            <Button onClick={() => setView('home')} icon={ArrowLeft} color="bg-gray-600">
                Back to Home
            </Button>
        </div>
    );

    const DoctorView = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-blue-400 flex items-center">
                <Stethoscope className="w-6 h-6 mr-3" /> Doctor Portal
            </h2>
            <UserCard 
                role="Doctor" 
                address={doctorAddress} 
                privateKey={doctorKey} 
            />
            
            <StatusMessage message={status.message} type={status.type} />

            {/* Registration */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">1. Register</h3>
                <Input label="Doctor Name" value={doctorName} onChange={setDoctorName} placeholder="E.g., Dr. Jane Doe" />
                <Input label="Private Key (Test Only)" value={doctorKey} onChange={setDoctorKey} type="password" placeholder="0x..." />
                <Input label="Public Address (For Display)" value={doctorAddress} onChange={setDoctorAddress} placeholder="0x..." />
                <Button onClick={() => handleRegistration('doctor')} icon={ClipboardCheck} color="bg-blue-600">
                    Register Doctor
                </Button>
            </div>
            
            {/* Add Record */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">2. Add Medical Record</h3>
                <p className="text-sm text-gray-400 mb-3">Requires patient's explicit access grant.</p>
                <Input 
                    label="Patient Address" 
                    value={recordPatientAddress} 
                    onChange={setRecordPatientAddress} 
                    placeholder="Patient's 0x address" 
                />
                <Input 
                    label="IPFS Data Hash" 
                    value={ipfsHash} 
                    onChange={setIpfsHash} 
                    placeholder="QmW... (Data link)" 
                />
                <Button onClick={handleAddRecord} icon={BriefcaseMedical} color="bg-green-600">
                    Submit New Record
                </Button>
            </div>

            {/* View Specific Record */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">3. View Specific Record (Doctor Check)</h3>
                
                {/* INPUT FOR DOCTOR ADDRESS */}
                <Input 
                    label="Your Doctor Address (Required)" 
                    value={viewDoctorAddress} 
                    onChange={setViewDoctorAddress} 
                    placeholder="Your 0x address for verification" 
                />
                
                <Input 
                    label="Record ID" 
                    value={viewRecordId} 
                    onChange={setViewRecordId} 
                    placeholder="Enter Record ID (e.g., 1, 2, 3)" 
                    type="number"
                />
                <Button onClick={handleGetRecord} icon={ClipboardCheck} color="bg-purple-600">
                    Fetch Record
                </Button>

                {viewedRecord && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg text-sm">
                        <p className="text-lg font-bold text-white mb-2">Record Details</p>
                        {/* Ensure object is iterable, using safe guard */}
                        {Object.entries(viewedRecord || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1 border-b border-gray-600 last:border-b-0">
                                <span className="font-medium text-gray-300">{key}:</span>
                                <span className="font-mono text-right text-teal-300 break-all">{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Button onClick={() => setView('home')} icon={ArrowLeft} color="bg-gray-600">
                Back to Home
            </Button>
        </div>
    );

    // Main render switch
    const renderView = () => {
        switch (view) {
            case 'patient':
                return <PatientView />;
            case 'doctor':
                return <DoctorView />;
            case 'home':
            default:
                return <HomeView />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-8">
            
            <div className="max-w-3xl mx-auto py-12">
                <header className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-white flex items-center justify-center">
                        <BriefcaseMedical className="w-10 h-10 mr-4 text-teal-400" />
                        Decentralized EHR
                    </h1>
                </header>
                
                {renderView()}
                
                <footer className="mt-12 text-center text-xs text-gray-500 border-t border-gray-800 pt-6">
                    <p>
                        Integration with Ethereum (Hardhat) Backend via Express Gateway.
                    </p>
                    <p>
                        **Warning: This application uses private keys for demonstration purposes. Do not use real funds.**
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;