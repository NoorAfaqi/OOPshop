package com.ooplab.oopshop_app.data.repository

import com.ooplab.oopshop_app.data.api.ApiResponse
import com.ooplab.oopshop_app.data.api.CreateOrderRequest
import com.ooplab.oopshop_app.data.api.CaptureRequest
import com.ooplab.oopshop_app.data.api.PayPalOrderResponse
import com.ooplab.oopshop_app.data.dto.CheckoutItemRequest
import com.ooplab.oopshop_app.data.dto.CheckoutRequest
import com.ooplab.oopshop_app.data.dto.InvoiceDto
import com.ooplab.oopshop_app.data.local.CartItemEntity
import com.ooplab.oopshop_app.data.network.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Response

class CheckoutRepository {

    private val checkoutApi = RetrofitClient.checkoutApi
    private val paymentApi = RetrofitClient.paymentApi

    suspend fun createCheckout(
        firstName: String,
        lastName: String,
        billingStreet: String,
        billingZip: String,
        billingCity: String,
        billingCountry: String,
        phone: String?,
        items: List<CartItemEntity>
    ): Result<InvoiceDto> = withContext(Dispatchers.IO) {
        val body = CheckoutRequest(
            firstName = firstName,
            lastName = lastName,
            phone = phone,
            billingStreet = billingStreet,
            billingZip = billingZip,
            billingCity = billingCity,
            billingCountry = billingCountry,
            items = items.map { CheckoutItemRequest(it.productId, it.quantity) }
        )
        val response = checkoutApi.processCheckout(body)
        when {
            response.isSuccessful -> {
                val apiResponse = response.body()
                when {
                    apiResponse != null && apiResponse.isSuccess() && apiResponse.data != null ->
                        Result.success(apiResponse.data)
                    else -> Result.failure(Exception(apiResponse?.message ?: "Checkout failed"))
                }
            }
            else -> Result.failure(Exception("${response.code()}: ${response.message()}"))
        }
    }

    suspend fun createPayPalOrder(invoiceId: Int, amount: Double, currency: String = "USD"): Result<PayPalOrderResponse> =
        withContext(Dispatchers.IO) {
            val response = paymentApi.createPayPalOrder(
                CreateOrderRequest(invoiceId = invoiceId, amount = amount, currency = currency)
            )
            when {
                response.isSuccessful -> {
                    val apiResponse = response.body()
                    when {
                        apiResponse != null && apiResponse.isSuccess() && apiResponse.data != null ->
                            Result.success(apiResponse.data)
                        else -> Result.failure(Exception(apiResponse?.message ?: "Create order failed"))
                    }
                }
                else -> Result.failure(Exception("${response.code()}: ${response.message()}"))
            }
        }

    suspend fun capturePayPalPayment(orderId: String, invoiceId: Int, userId: Int? = null): Result<Unit> =
        withContext(Dispatchers.IO) {
            val response = paymentApi.capturePayPalPayment(
                CaptureRequest(orderId = orderId, invoiceId = invoiceId, userId = userId)
            )
            when {
                response.isSuccessful -> Result.success(Unit)
                else -> Result.failure(Exception("${response.code()}: ${response.message()}"))
            }
        }
}
