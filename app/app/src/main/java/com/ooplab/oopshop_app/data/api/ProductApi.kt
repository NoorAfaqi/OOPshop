package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.ProductDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Product API matching backend routes in backend/src/routes/product.routes.js
 * Public: GET /products, GET /products/:id
 */
interface ProductApi {

    @GET("products")
    suspend fun getProducts(
        @Query("q") query: String? = null,
        @Query("category") category: String? = null,
        @Query("brand") brand: String? = null,
        @Query("available") available: Boolean? = null,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("sortBy") sortBy: String? = null,
        @Query("sortOrder") sortOrder: String? = null
    ): Response<ApiResponse<List<ProductDto>>>

    @GET("products/{id}")
    suspend fun getProductById(
        @Path("id") id: Int
    ): Response<ApiResponse<ProductDto>>

    /** Low stock products (auth required). GET /products/low-stock */
    @GET("products/low-stock")
    suspend fun getLowStockProducts(
        @Query("threshold") threshold: Int? = null
    ): Response<ApiResponse<List<ProductDto>>>
}
