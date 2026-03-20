package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.ProductDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
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

    /** Create product (auth required). POST /products */
    @POST("products")
    suspend fun createProduct(
        @Body request: CreateProductRequest
    ): Response<ApiResponse<ProductDto>>

    /** Fetch OpenFoodFacts data via backend (auth required). POST /products/from-barcode */
    @POST("products/from-barcode")
    suspend fun fetchProductFromBarcode(
        @Body request: BarcodeRequest
    ): Response<ApiResponse<FromBarcodeResponse>>

    /** Adjust stock quantity (auth required). POST /products/{id}/adjust-stock */
    @POST("products/{id}/adjust-stock")
    suspend fun adjustStock(
        @Path("id") id: Int,
        @Body request: StockAdjustmentRequest
    ): Response<ApiResponse<ProductDto>>
}

data class BarcodeRequest(
    val barcode: String
)

data class CreateProductRequest(
    val name: String,
    val price: Double,
    val brand: String? = null,
    val image_url: String? = null,
    val category: String? = null,
    val description: String? = null,
    val stock_quantity: Int = 0,
    val open_food_facts_barcode: String? = null
)

data class FromBarcodeResponse(
    val suggested: BarcodeSuggestedProduct? = null
)

data class BarcodeSuggestedProduct(
    val name: String? = null,
    val brand: String? = null,
    val image_url: String? = null,
    val category: String? = null,
    val open_food_facts_barcode: String? = null
)

data class StockAdjustmentRequest(
    val quantity_change: Int,
    val change_type: String = "adjustment",
    val reason: String? = null
)
