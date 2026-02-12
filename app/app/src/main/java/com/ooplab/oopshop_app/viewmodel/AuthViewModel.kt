package com.ooplab.oopshop_app.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.repository.AuthRepository
import com.ooplab.oopshop_app.data.repository.AuthResult
import com.ooplab.oopshop_app.data.repository.Resource

/**
 * ViewModel for login and register screens.
 * Exposes LiveData from AuthRepository for UI observation.
 */
class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    val loginResult: LiveData<Resource<AuthResult>> = authRepository.loginResult
    val registerResult: LiveData<Resource<AuthResult>> = authRepository.registerResult
    val currentUser: LiveData<Resource<UserDto>> = authRepository.currentUser

    fun login(email: String, password: String) {
        authRepository.login(email, password)
    }

    fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String? = null
    ) {
        authRepository.register(email, password, firstName, lastName, phone)
    }

    fun loadCurrentUser() {
        authRepository.loadCurrentUser()
    }

    fun logout() {
        authRepository.logout()
    }

    fun isLoggedIn(): Boolean = authRepository.isLoggedIn()

    val changePasswordResult: LiveData<Resource<Unit>> = authRepository.changePasswordResult

    fun changePassword(oldPassword: String, newPassword: String) {
        authRepository.changePassword(oldPassword, newPassword)
    }
}
