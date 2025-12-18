/**
 * Standard success response format
 */
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

/**
 * Standard error response format
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    status: "error",
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response format
 */
const paginatedResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    status: "success",
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};

