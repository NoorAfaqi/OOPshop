package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.SerializedName

/**
 * Invoice row from GET /invoices (admin/manager sees all)
 */
data class InvoiceListItemDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("total_amount") val totalAmount: Double,
    val status: String,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val email: String? = null
)
