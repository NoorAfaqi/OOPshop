package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.UserDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

/**
 * Users API (admin/manager only). GET /users, GET /users/:id
 */
interface UsersApi {

    @GET("users")
    suspend fun getUsers(): Response<ApiResponse<List<UserDto>>>

    @GET("users/{id}")
    suspend fun getUserById(@Path("id") id: Int): Response<ApiResponse<UserDto>>
}
