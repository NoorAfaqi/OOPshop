package com.ooplab.oopshop_app.ui.components

import com.ooplab.oopshop_app.data.dto.SalesTrendItemDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.temporal.ChronoUnit

class SalesTrendUtilsTest {

    @Test
    fun empty_returns_thirty_days_with_zero_totals() {
        val result = denseSalesTrendLast30Days(emptyList())
        assertEquals(30, result.size)
        assertTrue(result.all { it.total == 0.0 })
        val first = LocalDate.parse(result.first().date!!)
        val last = LocalDate.parse(result.last().date!!)
        assertEquals(29L, ChronoUnit.DAYS.between(first, last))
    }

    @Test
    fun maps_today_total() {
        val today = LocalDate.now().toString()
        val result = denseSalesTrendLast30Days(
            listOf(SalesTrendItemDto(date = today, total = 42.5))
        )
        val row = result.find { it.date == today }
        assertEquals(42.5, row!!.total!!, 0.001)
    }

    @Test
    fun ignores_out_of_range_dates() {
        val old = LocalDate.now().minusDays(100).toString()
        val result = denseSalesTrendLast30Days(
            listOf(SalesTrendItemDto(date = old, total = 999.0))
        )
        assertTrue(result.all { it.total == 0.0 })
    }

    @Test
    fun skips_invalid_date_strings() {
        val result = denseSalesTrendLast30Days(
            listOf(SalesTrendItemDto(date = "not-a-date", total = 1.0))
        )
        assertTrue(result.all { it.total == 0.0 })
    }

    @Test
    fun skips_null_total() {
        val today = LocalDate.now().toString()
        val result = denseSalesTrendLast30Days(
            listOf(SalesTrendItemDto(date = today, total = null))
        )
        assertEquals(0.0, result.find { it.date == today }!!.total!!, 0.001)
    }

    @Test
    fun sums_duplicate_days() {
        val today = LocalDate.now().toString()
        val result = denseSalesTrendLast30Days(
            listOf(
                SalesTrendItemDto(date = today, total = 10.0),
                SalesTrendItemDto(date = today, total = 5.0)
            )
        )
        assertEquals(15.0, result.find { it.date == today }!!.total!!, 0.001)
    }
}
