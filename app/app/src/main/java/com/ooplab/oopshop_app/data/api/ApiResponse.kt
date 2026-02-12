package com.ooplab.oopshop_app.data.api

/**
 * Wraps all API responses from OOPshop backend.
 * Backend returns: { status: "success"|"error", message?, data?, errors?, pagination? }
 */
data class ApiResponse<T>(
    val status: String,
    val message: String? = null,
    val data: T? = null,
    val errors: List<ApiError>? = null,
    val pagination: Pagination? = null
) {
    fun isSuccess(): Boolean = status == "success"
}

data class ApiError(
    val msg: String? = null,
    val param: String? = null,
    val location: String? = null
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int
)
