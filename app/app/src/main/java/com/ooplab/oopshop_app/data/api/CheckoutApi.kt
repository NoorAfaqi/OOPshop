package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.CheckoutRequest
import com.ooplab.oopshop_app.data.dto.InvoiceDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Checkout API matching backend POST /checkout (backend/src/routes/checkout.routes.js)
 */
interface CheckoutApi {

    @POST("checkout")
    suspend fun processCheckout(@Body body: CheckoutRequest): Response<ApiResponse<InvoiceDto>>
}
