package com.ooplab.oopshop_app.data.api

import com.ooplab.oopshop_app.data.dto.ReportDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Reports API (auth required, manager/admin). GET /reports
 */
interface ReportsApi {

    @GET("reports")
    suspend fun getReport(
        @Query("from") from: String? = null,
        @Query("to") to: String? = null
    ): Response<ApiResponse<ReportDto>>
}
