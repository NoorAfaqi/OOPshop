package com.ooplab.oopshop_app.data.api

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * PayPal endpoints: create-order, capture.
 * Backend: POST /payments/paypal/create-order, POST /payments/paypal/capture
 */
interface PaymentApi {

    @POST("payments/paypal/create-order")
    suspend fun createPayPalOrder(@Body body: CreateOrderRequest): Response<ApiResponse<PayPalOrderResponse>>

    @POST("payments/paypal/capture")
    suspend fun capturePayPalPayment(@Body body: CaptureRequest): Response<ApiResponse<CaptureResponse>>
}

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
