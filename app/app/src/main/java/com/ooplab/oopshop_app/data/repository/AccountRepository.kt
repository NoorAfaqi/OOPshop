package com.ooplab.oopshop_app.data.repository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.ooplab.oopshop_app.data.api.ApiResponse
import com.ooplab.oopshop_app.data.api.Pagination
import com.ooplab.oopshop_app.data.api.UpdateProfileRequest
import com.ooplab.oopshop_app.data.dto.OrderDetailDto
import com.ooplab.oopshop_app.data.dto.OrderSummaryDto
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Response

/**
 * Repository for account: profile, current orders, order history, order detail.
 * All endpoints require auth (Bearer token).
 */
class AccountRepository {

    private val api = RetrofitClient.accountApi
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _currentOrders = MutableLiveData<Resource<List<OrderSummaryDto>>>()
    val currentOrders: LiveData<Resource<List<OrderSummaryDto>>> = _currentOrders

    private val _orderHistory = MutableLiveData<Resource<OrderHistoryResult>>()
    val orderHistory: LiveData<Resource<OrderHistoryResult>> = _orderHistory

    private val _orderDetail = MutableLiveData<Resource<OrderDetailDto>>()
    val orderDetail: LiveData<Resource<OrderDetailDto>> = _orderDetail

    private val _profile = MutableLiveData<Resource<UserDto>>()
    val profile: LiveData<Resource<UserDto>> = _profile

    private val _updateProfileResult = MutableLiveData<Resource<UserDto>>()
    val updateProfileResult: LiveData<Resource<UserDto>> = _updateProfileResult

    fun loadCurrentOrders() {
        _currentOrders.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.getCurrentOrders() }
                _currentOrders.value = handleOrderListResponse(response)
            } catch (e: Exception) {
                _currentOrders.value = Resource.Error(e.message ?: "Failed to load orders", e)
            }
        }
    }

    fun loadOrderHistory(page: Int = 1, limit: Int = 10) {
        _orderHistory.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.getOrders(page = page, limit = limit) }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() -> {
                                val list = body.data ?: emptyList()
                                val pagination = body.pagination
                                _orderHistory.value = Resource.Success(
                                    OrderHistoryResult(list, pagination)
                                )
                            }
                            body != null -> _orderHistory.value = Resource.Error(body.message ?: "Request failed")
                            else -> _orderHistory.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _orderHistory.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _orderHistory.value = Resource.Error(e.message ?: "Failed to load order history", e)
            }
        }
    }

    fun loadOrderDetail(orderId: Int) {
        _orderDetail.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.getOrderById(orderId) }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _orderDetail.value = Resource.Success(body.data)
                            body != null -> _orderDetail.value = Resource.Error(body.message ?: "Request failed")
                            else -> _orderDetail.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _orderDetail.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _orderDetail.value = Resource.Error(e.message ?: "Failed to load order", e)
            }
        }
    }

    fun loadProfile() {
        _profile.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.getProfile() }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _profile.value = Resource.Success(body.data)
                            body != null -> _profile.value = Resource.Error(body.message ?: "Request failed")
                            else -> _profile.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _profile.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _profile.value = Resource.Error(e.message ?: "Failed to load profile", e)
            }
        }
    }

    fun updateProfile(
        firstName: String? = null,
        lastName: String? = null,
        phone: String? = null,
        billingStreet: String? = null,
        billingZip: String? = null,
        billingCity: String? = null,
        billingCountry: String? = null
    ) {
        _updateProfileResult.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    api.updateProfile(
                        UpdateProfileRequest(
                            first_name = firstName,
                            last_name = lastName,
                            phone = phone,
                            billing_street = billingStreet,
                            billing_zip = billingZip,
                            billing_city = billingCity,
                            billing_country = billingCountry
                        )
                    )
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _updateProfileResult.value = Resource.Success(body.data)
                            body != null -> _updateProfileResult.value = Resource.Error(body.message ?: "Request failed")
                            else -> _updateProfileResult.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _updateProfileResult.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _updateProfileResult.value = Resource.Error(e.message ?: "Failed to update profile", e)
            }
        }
    }

    private fun handleOrderListResponse(response: Response<ApiResponse<List<OrderSummaryDto>>>): Resource<List<OrderSummaryDto>> {
        return when {
            response.isSuccessful -> {
                val body = response.body()
                when {
                    body != null && body.isSuccess() -> Resource.Success(body.data ?: emptyList())
                    body != null -> Resource.Error(body.message ?: "Request failed")
                    else -> Resource.Error("Empty response")
                }
            }
            else -> Resource.Error("${response.code()}: ${response.message()}")
        }
    }
}

data class OrderHistoryResult(
    val orders: List<OrderSummaryDto>,
    val pagination: Pagination?
)