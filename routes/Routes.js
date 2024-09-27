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
const { upload, replaceFileIfExists, getPhoto } = require("../Aws/UploadPhoto");
// const uploadPhoto = require("../Aws/UploadPhoto");
const authenticateToken = require("../protectedRoute/protectedRoute");
const {
  AddOrderData,
  changeStatusOrder,
} = require("../collection/OrderController");
const {
  AddContactData,
  DeleteContact,
  UpdateContactData,
  GetContactList,
} = require("../collection/ContactController");
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/protected", TokenVerification);

//Receipt module
router.post("/addReceipt", AddReceiptData);
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
router.post("/getEventList", GetEventsList);
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
router.post("/getTestimonialList", GetTestimonialList);
router.post(
  "/deleteTestimonial/:testimonialId",
  authenticateToken,
  DeleteTestimonial
);
router.post("/addCMS", authenticateToken, AddCMSData);
router.post("/updateCMS/:CMDId", authenticateToken, UpdateCMSData);
router.post("/getCMSList", GetCMSList);
// Route to upload a photo with an ID in the URL
router.post(
  "/upload/:id",
  upload.single("file"), // Move this above replaceFileIfExists
  replaceFileIfExists,
  (req, res) => {
    res.send("File uploaded successfully");
  }
);

router.get("/file/:id", getPhoto);

router.get("/getOrder", AddOrderData);
router.get("/UpdateOrder", changeStatusOrder);

router.post("/addContact", AddContactData);
router.post("/updateContact/:ContactId", authenticateToken, UpdateContactData);
router.post("/getContactList", authenticateToken, GetContactList);
router.post("/deleteContact/:ContactId", authenticateToken, DeleteContact);

// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.send("File uploaded successfully to " + req.file.location);
// });
module.exports = router;
