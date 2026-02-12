package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.OrderDetailDto
import com.ooplab.oopshop_app.data.dto.OrderSummaryDto
import com.ooplab.oopshop_app.data.dto.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Account API (requires auth). Base path /account
 * GET /account/me, PUT /account/me, GET /account/orders, GET /account/orders/current, GET /account/orders/:id
 */
interface AccountApi {

    @GET("account/me")
    suspend fun getProfile(): Response<ApiResponse<UserDto>>

    @PUT("account/me")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): Response<ApiResponse<UserDto>>

    @GET("account/orders")
    suspend fun getOrders(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<ApiResponse<List<OrderSummaryDto>>>

    @GET("account/orders/current")
    suspend fun getCurrentOrders(): Response<ApiResponse<List<OrderSummaryDto>>>

    @GET("account/orders/{id}")
    suspend fun getOrderById(@Path("id") id: Int): Response<ApiResponse<OrderDetailDto>>
}

data class UpdateProfileRequest(
    val first_name: String? = null,
    val last_name: String? = null,
    val phone: String? = null,
    val billing_street: String? = null,
    val billing_zip: String? = null,
    val billing_city: String? = null,
    val billing_country: String? = null
)
