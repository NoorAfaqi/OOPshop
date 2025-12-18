const express = require("express");
const reportController = require("../controllers/report.controller");
const validate = require("../middleware/validation");
const { reportQueryValidator } = require("../validators/report.validator");

const router = express.Router();

// Report routes
router.get("/", reportQueryValidator, validate, reportController.generateReport);

module.exports = router;
