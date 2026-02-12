package com.ooplab.oopshop_app.data.repository

/**
 * Wraps repository result for UI: loading, success, or error.
 * Used with LiveData in ViewModels.
 */
sealed class Resource<out T> {
    data class Success<T>(val data: T) : Resource<T>()
    data class Error(val message: String, val throwable: Throwable? = null) : Resource<Nothing>()
    data object Loading : Resource<Nothing>()
}
