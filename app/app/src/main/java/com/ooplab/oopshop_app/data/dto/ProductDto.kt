package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.JsonAdapter
import com.google.gson.annotations.SerializedName

/**
 * Matches backend products table / API response.
 * nutritional_info can be a JSON object or a JSON string (MySQL JSON column).
 */
data class ProductDto(
    val id: Int,
    val name: String,
    val price: Double,
    val brand: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    val category: String? = null,
    val description: String? = null,
    @SerializedName("nutritional_info")
    @JsonAdapter(NutritionalInfoDeserializer::class)
    val nutritionalInfo: Map<String, Any>? = null,
    @SerializedName("stock_quantity") val stockQuantity: Int = 0,
    @SerializedName("open_food_facts_barcode") val barcode: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("updated_at") val updatedAt: String? = null
)
