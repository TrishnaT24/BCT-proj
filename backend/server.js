const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const cors = require("cors");


app.use(cors());
const controller = require("./controllers/contractController");

// Registration
app.post("/register/patient", controller.registerPatient);
app.post("/register/doctor", controller.registerDoctor);

// Access
app.post("/access/grant", controller.grantAccess);
app.post("/access/revoke", controller.revokeAccess);

// Records
app.post("/record/add", controller.addRecord);
app.get("/record/:id", controller.getRecord);
app.get("/records/:patient", controller.getRecordsByPatient);

app.listen(process.env.PORT || 4000, () =>
  console.log(`Server running`)
);
