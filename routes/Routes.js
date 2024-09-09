const express = require("express");
const {
  Register,
  Login,
  TokenVerification,
} = require("../collection/UserAuthController");
const {
  AddReceiptData,
  UpdateReceiptData,
  GetReceiptsList,
  DeleteReceipt,
} = require("../collection/ReceiptController");
const {
  AddTableData,
  UpdateTableData,
  GetTablesList,
  DeleteTable,
} = require("../collection/TableController");
const {
  AddUserInformationData,
  UpdateUserInformationData,
  GetUserInformationList,
  DeleteUserInformation,
} = require("../collection/UserInformation");
const upload = require("../Aws/UploadPhoto");
const authenticateToken = require("../protectedRoute/protectedRoute");
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/protected", TokenVerification);

//Receipt module
router.post("/addReceipt", authenticateToken, AddReceiptData);
router.post("/updateReceipt/:receiptId", authenticateToken, UpdateReceiptData);
router.post("/getReceiptList", authenticateToken, GetReceiptsList);
router.post("/deleteReceipt/:receiptId", authenticateToken, DeleteReceipt);

//Table module
router.post("/addTable", authenticateToken, AddTableData);
router.post("/updateTable/:tableId", authenticateToken, UpdateTableData);
router.post("/getTableList", authenticateToken, GetTablesList);
router.post("/deleteTable/:tableId", authenticateToken, DeleteTable);

//Table module
router.post("/addUserInformation", authenticateToken, AddUserInformationData);
router.post(
  "/updateUserInformation/:userId",
  authenticateToken,
  UpdateUserInformationData
);
router.post(
  "/getUserInformationList",
  authenticateToken,
  GetUserInformationList
);
router.post(
  "/deleteUserInformation/:userId",
  authenticateToken,
  DeleteUserInformation
);
// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.send("File uploaded successfully to " + req.file.location);
// });
module.exports = router;
