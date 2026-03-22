package com.ooplab.oopshop_app.data.prefs

import android.app.Application
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], application = Application::class)
class SessionManagerTest {

    @Before
    fun init() {
        SessionManager.init(ApplicationProvider.getApplicationContext())
        SessionManager.setToken(null)
    }

    @Test
    fun set_get_clear_token() {
        SessionManager.setToken("abc")
        assertEquals("abc", SessionManager.getToken())
        SessionManager.clearToken()
        assertNull(SessionManager.getToken())
    }
}
