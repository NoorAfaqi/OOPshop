package com.ooplab.oopshop_app.data.prefs

import android.content.Context
import android.content.SharedPreferences

/**
 * Persists JWT token so the session survives app restarts.
 * Call init(applicationContext) from MainActivity.onCreate.
 */
object SessionManager {

    private const val PREFS_NAME = "oopshop_session"
    private const val KEY_TOKEN = "auth_token"

    @Volatile
    private var prefs: SharedPreferences? = null

    fun init(context: Context) {
        if (prefs == null) {
            prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        }
    }

    fun getToken(): String? = prefs?.getString(KEY_TOKEN, null)

    fun setToken(token: String?) {
        prefs?.edit()?.apply {
            if (token != null) putString(KEY_TOKEN, token)
            else remove(KEY_TOKEN)
            apply()
        }
    }

    fun clearToken() = setToken(null)
}
