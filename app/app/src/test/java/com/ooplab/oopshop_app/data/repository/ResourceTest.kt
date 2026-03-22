package com.ooplab.oopshop_app.data.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ResourceTest {

    @Test
    fun success_holds_data() {
        val r = Resource.Success("ok")
        assertEquals("ok", r.data)
    }

    @Test
    fun error_holds_message() {
        val r = Resource.Error("failed")
        assertEquals("failed", r.message)
        assertNull(r.throwable)
    }

    @Test
    fun error_can_include_throwable() {
        val cause = IllegalStateException("x")
        val r = Resource.Error("wrapped", cause)
        assertEquals(cause, r.throwable)
    }

    @Test
    fun loading_is_singleton() {
        assertEquals(Resource.Loading, Resource.Loading)
    }
}
