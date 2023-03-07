const express = require("express");
const protect = require("../middleWare/authMiddleware");
const router = express.Router();
const { contactUs } = require("../controllers/contactController");

router.post("/", protect, contactUs);

module.exports = router;
