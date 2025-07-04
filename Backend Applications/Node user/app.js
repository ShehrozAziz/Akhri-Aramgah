const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userController = require("./controllers/userController");
const complaintController = require("./controllers/complaintController");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.post("/api/signup", userController.signup);
app.post("/api/signin", userController.signin);
app.post("/api/checkemail", userController.checkEmailExists);
app.post("/api/userdetails", userController.userDetails);
app.post("/api/changePhonenumber", userController.changePhonenumber);
app.post("/api/changeName", userController.changeName);
app.post("/api/updateDateOfBirth", userController.updateDateOfBirth);
app.post("/api/changePassword", userController.changePassword);
app.get("/api/getUsername", userController.getUsername);
app.post("/api/register-complaint", complaintController.registerComplaint);
app.post("/api/get-complaints", complaintController.getComplaintsByUser);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
