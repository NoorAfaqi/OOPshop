package com.ooplab.oopshop_app.data.network

import com.ooplab.oopshop_app.BuildConfig
import com.ooplab.oopshop_app.data.prefs.SessionManager
import com.ooplab.oopshop_app.data.api.AccountApi
import com.ooplab.oopshop_app.data.api.AuthApi
import com.ooplab.oopshop_app.data.api.CheckoutApi
import com.ooplab.oopshop_app.data.api.InvoicesApi
import com.ooplab.oopshop_app.data.api.PaymentApi
import com.ooplab.oopshop_app.data.api.ProductApi
import com.ooplab.oopshop_app.data.api.ReportsApi
import com.ooplab.oopshop_app.data.api.UsersApi
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Retrofit client and API holders. Provides authenticated and public APIs.
 * Base URL: from BuildConfig.API_BASE_URL (default http://10.0.2.2:3001/ for emulator).
 */
object RetrofitClient {

    /** Long enough for chained calls (e.g. product recommendations → ML service on cold start). */
    private const val TIMEOUT_SEC = 90L

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
        else HttpLoggingInterceptor.Level.NONE
    }

    private val authInterceptor = Interceptor { chain ->
        val token = TokenHolder.token
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Content-Type", "application/json")
                .build()
        } else {
            chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")
                .build()
        }
        chain.proceed(request)
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(TIMEOUT_SEC, TimeUnit.SECONDS)
        .readTimeout(TIMEOUT_SEC, TimeUnit.SECONDS)
        .writeTimeout(TIMEOUT_SEC, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .addInterceptor(authInterceptor)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(ensureTrailingSlash(BuildConfig.API_BASE_URL))
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val productApi: ProductApi get() = retrofit.create(ProductApi::class.java)
    val authApi: AuthApi get() = retrofit.create(AuthApi::class.java)
    val accountApi: AccountApi get() = retrofit.create(AccountApi::class.java)
    val checkoutApi: CheckoutApi get() = retrofit.create(CheckoutApi::class.java)
    val paymentApi: PaymentApi get() = retrofit.create(PaymentApi::class.java)
    val reportsApi: ReportsApi get() = retrofit.create(ReportsApi::class.java)
    val invoicesApi: InvoicesApi get() = retrofit.create(InvoicesApi::class.java)
    val usersApi: UsersApi get() = retrofit.create(UsersApi::class.java)

    fun setAuthToken(token: String?) {
        TokenHolder.token = token
        SessionManager.setToken(token)
    }

    private fun ensureTrailingSlash(url: String): String {
        return if (url.endsWith("/")) url else "$url/"
    }
}

object TokenHolder {
    private var _token: String? = null
    var token: String?
        get() = _token ?: SessionManager.getToken().also { _token = it }
        set(value) {
            _token = value
            SessionManager.setToken(value)
        }
}
