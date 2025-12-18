const checkoutService = require("../services/checkout.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @swagger
 * /checkout:
 *   post:
 *     tags: [Checkout]
 *     summary: Process checkout
 *     description: Create customer and invoice with items (public endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - billing_street
 *               - billing_zip
 *               - billing_city
 *               - billing_country
 *               - items
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               billing_street:
 *                 type: string
 *                 example: 123 Main St
 *               billing_zip:
 *                 type: string
 *                 example: "12345"
 *               billing_city:
 *                 type: string
 *                 example: New York
 *               billing_country:
 *                 type: string
 *                 example: USA
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Checkout processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 */
const processCheckout = asyncHandler(async (req, res) => {
  const invoice = await checkoutService.processCheckout(req.body);
  successResponse(res, invoice, "Checkout processed successfully", 201);
});

module.exports = {
  processCheckout,
};

