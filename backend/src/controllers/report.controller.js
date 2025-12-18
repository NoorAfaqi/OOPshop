const reportService = require("../services/report.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

const generateReport = asyncHandler(async (req, res) => {
  const report = await reportService.generateReport(req.query);
  successResponse(res, report, "Report generated successfully");
});

module.exports = {
  generateReport,
};
