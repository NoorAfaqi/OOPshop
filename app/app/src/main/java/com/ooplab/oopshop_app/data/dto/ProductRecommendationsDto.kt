package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.SerializedName

/**
 * GET /products/:id/recommendations — backend success `data` payload.
 */
data class ProductRecommendationsDataDto(
    @SerializedName("product_id") val productId: Int,
    val k: Int,
    val recommendations: List<ProductRecommendationItemDto> = emptyList()
)

data class ProductRecommendationItemDto(
    val similarity: Double,
    val product: ProductDto? = null
)
