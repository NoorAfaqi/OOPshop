package com.ooplab.oopshop_app.data.api

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ApiResponseTest {

    @Test
    fun isSuccess_true_when_status_success() {
        val r = ApiResponse(status = "success", data = "payload")
        assertTrue(r.isSuccess())
    }

    @Test
    fun isSuccess_false_for_error_status() {
        val r = ApiResponse<String>(status = "error", message = "nope")
        assertFalse(r.isSuccess())
    }

    @Test
    fun preserves_optional_fields() {
        val r = ApiResponse(
            status = "success",
            message = "m",
            data = 1,
            errors = listOf(ApiError(msg = "e")),
            pagination = Pagination(page = 1, limit = 10, total = 100, pages = 10)
        )
        assertEquals(1, r.data)
        assertEquals("m", r.message)
        assertEquals(1, r.errors?.size)
        assertEquals(10, r.pagination?.pages)
    }

    @Test
    fun minimal_success() {
        val r = ApiResponse<Unit>(status = "success")
        assertNull(r.data)
        assertTrue(r.isSuccess())
    }
}
