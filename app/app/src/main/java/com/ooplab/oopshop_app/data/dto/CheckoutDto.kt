package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.SerializedName

/**
 * Checkout request/response matching backend POST /checkout.
 */
data class CheckoutItemRequest(
    @SerializedName("product_id") val productId: Int,
    val quantity: Int
)

data class CheckoutRequest(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val phone: String? = null,
    @SerializedName("billing_street") val billingStreet: String,
    @SerializedName("billing_zip") val billingZip: String,
    @SerializedName("billing_city") val billingCity: String,
    @SerializedName("billing_country") val billingCountry: String,
    val items: List<CheckoutItemRequest>
)

data class InvoiceDto(
    val id: Int,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("customer_id") val customerId: Int? = null,
    @SerializedName("total_amount") val totalAmount: Double,
    val status: String,
    @SerializedName("created_at") val createdAt: String? = null
)
