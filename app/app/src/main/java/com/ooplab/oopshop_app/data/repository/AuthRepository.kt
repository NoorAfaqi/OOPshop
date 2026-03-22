package com.ooplab.oopshop_app.data.repository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.ooplab.oopshop_app.data.api.ApiResponse
import com.ooplab.oopshop_app.data.api.ChangePasswordRequest
import com.ooplab.oopshop_app.data.dto.AuthResponse
import com.ooplab.oopshop_app.data.dto.LoginRequest
import com.ooplab.oopshop_app.data.dto.RegisterRequest
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.network.RetrofitClient
import com.ooplab.oopshop_app.data.network.TokenHolder
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Response

/**
 * Repository for auth: login, register, current user.
 * Persists token via RetrofitClient and exposes LiveData for UI.
 */
class AuthRepository {

    private val api = RetrofitClient.authApi
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _loginResult = MutableLiveData<Resource<AuthResult>>()
    val loginResult: LiveData<Resource<AuthResult>> = _loginResult

    private val _registerResult = MutableLiveData<Resource<AuthResult>>()
    val registerResult: LiveData<Resource<AuthResult>> = _registerResult

    private val _currentUser = MutableLiveData<Resource<UserDto>>()
    val currentUser: LiveData<Resource<UserDto>> = _currentUser

    private val _changePasswordResult = MutableLiveData<Resource<Unit>>()
    val changePasswordResult: LiveData<Resource<Unit>> = _changePasswordResult

    fun changePassword(oldPassword: String, newPassword: String) {
        _changePasswordResult.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    api.changePassword(ChangePasswordRequest(oldPassword, newPassword))
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() -> _changePasswordResult.value = Resource.Success(Unit)
                            body != null -> _changePasswordResult.value = Resource.Error(body.message ?: "Request failed")
                            else -> _changePasswordResult.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _changePasswordResult.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _changePasswordResult.value = Resource.Error(e.message ?: "Failed to change password", e)
            }
        }
    }

    fun login(email: String, password: String) {
        _loginResult.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    api.login(LoginRequest(email, password))
                }
                val result = handleAuthResponse(response) { data ->
                    RetrofitClient.setAuthToken(data.token)
                    val user = data.getUserOrManager()
                    if (user != null) _currentUser.value = Resource.Success(user)
                    AuthResult(data.token, user)
                }
                _loginResult.value = result
            } catch (e: Exception) {
                _loginResult.value = Resource.Error(e.message ?: "Login failed", e)
            }
        }
    }

    fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String? = null
    ) {
        _registerResult.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    api.register(
                        RegisterRequest(
                            email = email,
                            password = password,
                            firstName = firstName,
                            lastName = lastName,
                            phone = phone
                        )
                    )
                }
                val result = handleAuthResponse(response) { data ->
                    RetrofitClient.setAuthToken(data.token)
                    val user = data.getUserOrManager()
                    if (user != null) _currentUser.value = Resource.Success(user)
                    AuthResult(data.token, user)
                }
                _registerResult.value = result
            } catch (e: Exception) {
                _registerResult.value = Resource.Error(e.message ?: "Register failed", e)
            }
        }
    }

    @Volatile
    private var loadCurrentUserInFlight = false

    fun loadCurrentUser() {
        if (TokenHolder.token == null) {
            _currentUser.value = Resource.Error("Not logged in")
            return
        }
        if (loadCurrentUserInFlight) return
        loadCurrentUserInFlight = true
        _currentUser.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.getCurrentUser() }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _currentUser.value = Resource.Success(body.data)
                            body != null -> _currentUser.value = Resource.Error(body.message ?: "Request failed")
                            else -> _currentUser.value = Resource.Error("Empty response")
                        }
                    }
                    response.code() == 401 -> {
                        // Token expired or invalid: clear session so user can log in again
                        RetrofitClient.setAuthToken(null)
                        _currentUser.value = Resource.Error("Session expired. Please log in again.")
                    }
                    else -> _currentUser.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _currentUser.value = Resource.Error(e.message ?: "Unknown error", e)
            } finally {
                loadCurrentUserInFlight = false
            }
        }
    }

    fun logout() {
        RetrofitClient.setAuthToken(null)
        _currentUser.value = Resource.Error("Not logged in")
    }

    fun isLoggedIn(): Boolean = TokenHolder.token != null

    private fun handleAuthResponse(
        response: Response<ApiResponse<AuthResponse>>,
        onSuccess: (AuthResponse) -> AuthResult
    ): Resource<AuthResult> {
        return when {
            response.isSuccessful -> {
                val body = response.body()
                when {
                    body != null && body.isSuccess() && body.data != null ->
                        Resource.Success(onSuccess(body.data))
                    body != null -> Resource.Error(body.message ?: "Request failed")
                    else -> Resource.Error("Empty response")
                }
            }
            else -> Resource.Error("${response.code()}: ${response.message()}")
        }
    }
}

data class AuthResult(val token: String, val user: UserDto?)
