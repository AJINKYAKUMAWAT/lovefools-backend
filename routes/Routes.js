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

const {
  AddEventData,
  UpdateEventData,
  GetEventsList,
  DeleteEvent,
} = require("../collection/EventController");
const {
  AddGalleryData,
  UpdateGalleryData,
  GetGalleryList,
  DeleteGallery,
} = require("../collection/GalleryController");
const {
  AddTestimonialData,
  UpdateTestimonialData,
  GetTestimonialList,
  DeleteTestimonial,
} = require("../collection/TestimonialController");
const {
  AddCMSData,
  UpdateCMSData,
  GetCMSList,
  DeleteCMS,
} = require("../collection/CMSController");
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

//Table module
router.post("/addEvent", authenticateToken, AddEventData);
router.post("/updateEvent/:eventId", authenticateToken, UpdateEventData);
router.post("/getEventList", authenticateToken, GetEventsList);
router.post("/deleteEvent/:eventId", authenticateToken, DeleteEvent);

//Gallery module
router.post("/addGallery", authenticateToken, AddGalleryData);
router.post("/updateGallery/:galleryId", authenticateToken, UpdateGalleryData);
router.post("/getGalleryList", authenticateToken, GetGalleryList);
router.post("/deleteGallery/:galleryId", authenticateToken, DeleteGallery);

//Testimonial module
router.post("/addTestimonial", authenticateToken, AddTestimonialData);
router.post(
  "/updateTestimonial/:testimonialId",
  authenticateToken,
  UpdateTestimonialData
);
router.post("/getTestimonialList", authenticateToken, GetTestimonialList);
router.post(
  "/deleteTestimonial/:testimonialId",
  authenticateToken,
  DeleteTestimonial
);
router.post("/addCMS", authenticateToken, AddCMSData);
router.post("/updateCMS/:CMDId", authenticateToken, UpdateCMSData);
router.post("/getCMSList", authenticateToken, GetCMSList);

// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.send("File uploaded successfully to " + req.file.location);
// });
module.exports = router;
