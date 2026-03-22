package com.ooplab.oopshop_app.data.dto

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AuthResponseTest {

    @Test
    fun getUserOrManager_prefers_user() {
        val u = UserDto(id = 1, email = "a@b.c")
        val m = UserDto(id = 2, email = "m@b.c")
        val r = AuthResponse(token = "t", user = u, manager = m)
        assertEquals(u, r.getUserOrManager())
    }

    @Test
    fun getUserOrManager_falls_back_to_manager() {
        val m = UserDto(id = 2, email = "m@b.c")
        val r = AuthResponse(token = "t", user = null, manager = m)
        assertEquals(m, r.getUserOrManager())
    }

    @Test
    fun getUserOrManager_null_when_both_null() {
        val r = AuthResponse(token = "t", user = null, manager = null)
        assertNull(r.getUserOrManager())
    }
}
