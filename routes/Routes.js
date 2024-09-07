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

// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.send("File uploaded successfully to " + req.file.location);
// });
module.exports = router;
