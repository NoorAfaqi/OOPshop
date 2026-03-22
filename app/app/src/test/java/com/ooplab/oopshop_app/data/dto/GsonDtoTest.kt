package com.ooplab.oopshop_app.data.dto

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GsonDtoTest {

    private val gson = Gson()

    @Test
    fun userDto_parses_is_active_as_number() {
        val json = """{"id":1,"email":"a@b.c","is_active":1}"""
        val u = gson.fromJson(json, UserDto::class.java)
        assertTrue(u.isActive == true)
    }

    @Test
    fun userDto_parses_is_active_as_zero() {
        val json = """{"id":1,"email":"a@b.c","is_active":0}"""
        val u = gson.fromJson(json, UserDto::class.java)
        assertFalse(u.isActive == true)
    }

    @Test
    fun userDto_parses_is_active_as_boolean() {
        val json = """{"id":1,"email":"a@b.c","is_active":false}"""
        val u = gson.fromJson(json, UserDto::class.java)
        assertEquals(false, u.isActive)
    }

    @Test
    fun authResponse_roundTrip_with_manager() {
        val m = UserDto(id = 2, email = "m@b.c")
        val original = AuthResponse(token = "t", user = null, manager = m)
        val json = gson.toJson(original)
        val back = gson.fromJson(json, AuthResponse::class.java)
        assertEquals(m.id, back.getUserOrManager()?.id)
    }

    @Test
    fun reportDto_sales_trend() {
        val json = """{"total_sales":10.5,"sales_trend":[{"date":"2024-01-01","total":3.0}]}"""
        val r = gson.fromJson(json, ReportDto::class.java)
        assertEquals(10.5, r.totalSales!!, 0.001)
        assertEquals("2024-01-01", r.salesTrend?.first()?.date)
    }

    @Test
    fun orderSummaryDto() {
        val json =
            """{"id":1,"total_amount":9.99,"status":"paid","created_at":"2024-01-01","item_count":2}"""
        val o = gson.fromJson(json, OrderSummaryDto::class.java)
        assertEquals(1, o.id)
        assertEquals(9.99, o.totalAmount, 0.001)
        assertEquals(2, o.itemCount)
    }

    @Test
    fun orderDetailDto_with_items() {
        val json = """{"id":1,"total_amount":5.0,"status":"new","items":[{"id":10,"quantity":2,"unit_price":2.5,"name":"P"}]}"""
        val o = gson.fromJson(json, OrderDetailDto::class.java)
        assertEquals(1, o.items?.size)
        assertEquals("P", o.items?.first()?.name)
    }

    @Test
    fun invoiceDetailDto() {
        val json = """{"id":3,"total_amount":12.0,"status":"ok","items":[{"name":"A","quantity":1}]}"""
        val i = gson.fromJson(json, InvoiceDetailDto::class.java)
        assertEquals(3, i.id)
        assertEquals("A", i.items?.first()?.name)
    }

    @Test
    fun productRecommendationsDataDto() {
        val json =
            """{"product_id":1,"k":5,"recommendations":[{"similarity":0.9,"product":{"id":2,"name":"Y","price":3.0}}]}"""
        val d = gson.fromJson(json, ProductRecommendationsDataDto::class.java)
        assertEquals(1, d.productId)
        assertEquals("Y", d.recommendations.first().product?.name)
    }
}
