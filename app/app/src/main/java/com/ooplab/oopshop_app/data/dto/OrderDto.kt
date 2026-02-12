package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.SerializedName

/**
 * Order summary from GET /account/orders or GET /account/orders/current
 */
data class OrderSummaryDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("total_amount") val totalAmount: Double,
    val status: String,
    @SerializedName("created_at") val createdAt: String? = null,
    val items: String? = null, // "Product A x 2, Product B x 1"
    @SerializedName("item_count") val itemCount: Int? = null
)

/**
 * Order detail from GET /account/orders/:id (includes line items)
 */
data class OrderDetailDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("total_amount") val totalAmount: Double,
    val status: String,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    @SerializedName("billing_street") val billingStreet: String? = null,
    @SerializedName("billing_zip") val billingZip: String? = null,
    @SerializedName("billing_city") val billingCity: String? = null,
    @SerializedName("billing_country") val billingCountry: String? = null,
    val items: List<OrderItemDto>? = null
)

/**
 * Line item in order detail
 */
data class OrderItemDto(
    val id: Int,
    @SerializedName("invoice_id") val invoiceId: Int? = null,
    @SerializedName("product_id") val productId: Int? = null,
    val quantity: Int,
    @SerializedName("unit_price") val unitPrice: Double,
    val name: String? = null,
    val brand: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    val category: String? = null
)
