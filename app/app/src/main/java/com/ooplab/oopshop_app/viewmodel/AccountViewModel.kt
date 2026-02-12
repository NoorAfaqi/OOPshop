package com.ooplab.oopshop_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.ooplab.oopshop_app.data.dto.OrderDetailDto
import com.ooplab.oopshop_app.data.dto.OrderSummaryDto
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.repository.AccountRepository
import com.ooplab.oopshop_app.data.repository.OrderHistoryResult
import com.ooplab.oopshop_app.data.repository.Resource

/**
 * ViewModel for account: current orders, order history, order detail, profile update.
 */
class AccountViewModel(application: Application) : AndroidViewModel(application) {

    private val accountRepository = AccountRepository()

    val currentOrders: LiveData<Resource<List<OrderSummaryDto>>> = accountRepository.currentOrders
    val orderHistory: LiveData<Resource<OrderHistoryResult>> = accountRepository.orderHistory
    val orderDetail: LiveData<Resource<OrderDetailDto>> = accountRepository.orderDetail
    val profile: LiveData<Resource<UserDto>> = accountRepository.profile
    val updateProfileResult: LiveData<Resource<UserDto>> = accountRepository.updateProfileResult

    fun loadCurrentOrders() = accountRepository.loadCurrentOrders()
    fun loadOrderHistory(page: Int = 1, limit: Int = 10) = accountRepository.loadOrderHistory(page, limit)
    fun loadOrderDetail(orderId: Int) = accountRepository.loadOrderDetail(orderId)
    fun loadProfile() = accountRepository.loadProfile()
    fun updateProfile(
        firstName: String? = null,
        lastName: String? = null,
        phone: String? = null,
        billingStreet: String? = null,
        billingZip: String? = null,
        billingCity: String? = null,
        billingCountry: String? = null
    ) = accountRepository.updateProfile(
        firstName, lastName, phone,
        billingStreet, billingZip, billingCity, billingCountry
    )
}
