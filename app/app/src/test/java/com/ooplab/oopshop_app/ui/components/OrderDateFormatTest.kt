package com.ooplab.oopshop_app.ui.components

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class OrderDateFormatTest {

    @Test
    fun parses_iso_date_prefix() {
        val s = formatOrderDate("2024-03-15T12:00:00Z")
        assertTrue(s.contains("2024"))
        assertTrue(s.contains("15"))
    }

    @Test
    fun invalid_returns_first_ten_chars() {
        val raw = "not-a-date-extra"
        assertEquals("not-a-date", formatOrderDate(raw))
    }
}
