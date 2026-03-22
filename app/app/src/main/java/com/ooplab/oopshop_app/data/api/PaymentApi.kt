package com.ooplab.oopshop_app.data.api

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Payments API. GET /payments (admin list), PayPal create-order, capture.
 */
interface PaymentApi {

    @GET("payments")
    suspend fun getPayments(): Response<ApiResponse<List<PaymentListItemDto>>>

    @POST("payments/paypal/create-order")
    suspend fun createPayPalOrder(@Body body: CreateOrderRequest): Response<ApiResponse<PayPalOrderResponse>>

    @POST("payments/paypal/capture")
    suspend fun capturePayPalPayment(@Body body: CaptureRequest): Response<ApiResponse<CaptureResponse>>
}

/** Payment row from GET /payments (p.*, first_name, last_name, email, total_amount) */
data class PaymentListItemDto(
    val id: Int? = null,
    @SerializedName("invoice_id") val invoiceId: Int? = null,
    @SerializedName("user_id") val userId: Int? = null,
    val amount: Double? = null,
    val method: String? = null,
    val status: String? = null,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val email: String? = null,
    @SerializedName("total_amount") val totalAmount: Double? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class CreateOrderRequest(
    @SerializedName("invoice_id") val invoiceId: Int,
    val amount: Double,
    val currency: String = "USD",
    val description: String? = null
)

data class PayPalOrderResponse(
    val id: String,
    val status: String? = null,
    val links: List<PayPalLink>? = null
) {
    fun getApprovalUrl(): String? = links?.find { it.rel == "approve" }?.href
}

data class PayPalLink(
    val href: String,
    val rel: String,
    val method: String? = null
)

data class CaptureRequest(
    @SerializedName("orderId") val orderId: String,
    @SerializedName("invoice_id") val invoiceId: Int,
    @SerializedName("user_id") val userId: Int? = null
)

data class CaptureResponse(
    val capture: Any? = null,
    val payment: Any? = null
)
