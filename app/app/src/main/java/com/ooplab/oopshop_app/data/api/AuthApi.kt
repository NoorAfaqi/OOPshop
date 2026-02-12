package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.AuthResponse
import com.ooplab.oopshop_app.data.dto.LoginRequest
import com.ooplab.oopshop_app.data.dto.RegisterRequest
import com.ooplab.oopshop_app.data.dto.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Auth API matching backend routes in backend/src/routes/auth.routes.js
 * POST /auth/login, POST /auth/register, GET /auth/me (requires Bearer token)
 */
interface AuthApi {

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<ApiResponse<AuthResponse>>

    @GET("auth/me")
    suspend fun getCurrentUser(): Response<ApiResponse<UserDto>>

    @POST("auth/change-password")
    suspend fun changePassword(
        @Body body: ChangePasswordRequest
    ): Response<ApiResponse<Unit>>
}

data class ChangePasswordRequest(
    val oldPassword: String,
    val newPassword: String
)
