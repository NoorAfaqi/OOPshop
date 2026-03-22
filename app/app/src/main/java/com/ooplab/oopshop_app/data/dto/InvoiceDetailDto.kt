package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.SerializedName

/**
 * Invoice by ID from GET /invoices/:id (invoice + user fields + items).
 */
data class InvoiceDetailDto(
    val id: Int? = null,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("total_amount") val totalAmount: Double? = null,
    val status: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    @SerializedName("billing_street") val billingStreet: String? = null,
    @SerializedName("billing_zip") val billingZip: String? = null,
    @SerializedName("billing_city") val billingCity: String? = null,
    @SerializedName("billing_country") val billingCountry: String? = null,
    val items: List<InvoiceItemDto>? = null
)

data class InvoiceItemDto(
    @SerializedName("product_id") val productId: Int? = null,
    val quantity: Int? = null,
    @SerializedName("unit_price") val unitPrice: Double? = null,
    val name: String? = null
)
