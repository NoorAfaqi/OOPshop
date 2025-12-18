const { query } = require("express-validator");

const reportQueryValidator = [
  query("from")
    .optional()
    .isISO8601()
    .withMessage("From date must be in ISO 8601 format (YYYY-MM-DD)"),
  query("to")
    .optional()
    .isISO8601()
    .withMessage("To date must be in ISO 8601 format (YYYY-MM-DD)")
    .custom((to, { req }) => {
      if (req.query.from && to) {
        const fromDate = new Date(req.query.from);
        const toDate = new Date(to);
        if (toDate < fromDate) {
          throw new Error("To date must be after from date");
        }
      }
      return true;
    }),
];

module.exports = {
  reportQueryValidator,
};
