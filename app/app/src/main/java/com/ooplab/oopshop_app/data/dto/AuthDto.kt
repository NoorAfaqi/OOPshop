package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.JsonAdapter
import com.google.gson.annotations.SerializedName

/**
 * Login/Register request and response DTOs matching backend auth routes.
 */

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val phone: String? = null,
    val role: String? = "customer"
)

data class UserDto(
    val id: Int,
    val email: String,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val phone: String? = null,
    val role: String? = null,
    @SerializedName("is_active") @JsonAdapter(BooleanOrNumberDeserializer::class) val isActive: Boolean? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("billing_street") val billingStreet: String? = null,
    @SerializedName("billing_zip") val billingZip: String? = null,
    @SerializedName("billing_city") val billingCity: String? = null,
    @SerializedName("billing_country") val billingCountry: String? = null
)

data class AuthResponse(
    val token: String,
    val user: UserDto? = null,
    @SerializedName("manager") val manager: UserDto? = null
) {
    fun getUserOrManager(): UserDto? = user ?: manager
}
