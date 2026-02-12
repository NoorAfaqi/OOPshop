package com.ooplab.oopshop_app.data.dto

import com.google.gson.annotations.SerializedName

/**
 * Response from GET /reports?from=&to=
 */
data class ReportDto(
    @SerializedName("total_sales") val totalSales: Double? = null,
    @SerializedName("avg_purchase") val avgPurchase: Double? = null,
    @SerializedName("most_purchased_products") val mostPurchasedProducts: List<MostPurchasedProductDto>? = null,
    @SerializedName("median_payment") val medianPayment: Double? = null,
    @SerializedName("sales_trend") val salesTrend: List<SalesTrendItemDto>? = null
)

data class MostPurchasedProductDto(
    val id: Int? = null,
    val name: String? = null,
    @SerializedName("total_quantity") val totalQuantity: Int? = null
)

data class SalesTrendItemDto(
    val date: String? = null,
    val total: Double? = null
)
