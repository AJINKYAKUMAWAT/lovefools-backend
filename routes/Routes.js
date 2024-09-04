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
} = require("../collection/ReceiptController");
const upload = require("../Aws/UploadPhoto");
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/protected", TokenVerification);

//Receipt module
router.post("/AddReceipt", AddReceiptData);
router.post("/updateReceipt", UpdateReceiptData);
router.post("/GetReceiptList", GetReceiptsList);
// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.send("File uploaded successfully to " + req.file.location);
// });
module.exports = router;
