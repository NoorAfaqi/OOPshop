package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.InvoiceDetailDto
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

/**
 * Invoices API (auth required). GET /invoices - for manager returns all, for customer returns own.
 * Used by admin panel to list all orders.
 */
interface InvoicesApi {

    @GET("invoices")
    suspend fun getAllInvoices(): Response<ApiResponse<List<InvoiceListItemDto>>>

    @GET("invoices/{id}")
    suspend fun getInvoiceById(@Path("id") id: Int): Response<ApiResponse<InvoiceDetailDto>>
}
