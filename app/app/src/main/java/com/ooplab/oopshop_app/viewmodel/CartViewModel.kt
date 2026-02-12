package com.ooplab.oopshop_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.local.CartItemEntity
import com.ooplab.oopshop_app.data.repository.CartRepository
import com.ooplab.oopshop_app.data.repository.CheckoutRepository
import com.ooplab.oopshop_app.data.repository.Resource
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers

class CartViewModel(application: Application) : AndroidViewModel(application) {

    private val cartRepository = CartRepository(application.applicationContext)
    private val checkoutRepository = CheckoutRepository()

    val cartItems: LiveData<List<CartItemEntity>> = cartRepository.cartItems.asLiveData()

    private val _checkoutResult = MutableLiveData<Resource<CheckoutResult>?>()
    val checkoutResult: MutableLiveData<Resource<CheckoutResult>?> = _checkoutResult

    /** One-shot message for toasts (e.g. "Payment successful"). Observe and clear after showing. */
    private val _toastMessage = MutableLiveData<String?>(null)
    val toastMessage: LiveData<String?> = _toastMessage

    fun clearToastMessage() {
        _toastMessage.value = null
    }

    fun addToCart(product: ProductDto, quantity: Int = 1) {
        cartRepository.addOrUpdate(product, quantity)
    }

    fun updateQuantity(productId: Int, quantity: Int) {
        cartRepository.setQuantity(productId, quantity)
    }

    fun removeFromCart(productId: Int) {
        cartRepository.remove(productId)
    }

    suspend fun getCartItems(): List<CartItemEntity> = cartRepository.getAllItems()

    fun clearCart() {
        viewModelScope.launch {
            withContext(Dispatchers.IO) { cartRepository.clearCart() }
        }
    }

    fun setCheckoutResult(result: Resource<CheckoutResult>?) {
        _checkoutResult.value = result
    }

    fun startCheckout(
        firstName: String,
        lastName: String,
        billingStreet: String,
        billingZip: String,
        billingCity: String,
        billingCountry: String,
        phone: String? = null
    ) {
        viewModelScope.launch {
            _checkoutResult.value = Resource.Loading
            val items = withContext(Dispatchers.IO) { cartRepository.getAllItems() }
            if (items.isEmpty()) {
                _checkoutResult.value = Resource.Error("Cart is empty")
                return@launch
            }
            val invoiceResult = checkoutRepository.createCheckout(
                firstName, lastName, billingStreet, billingZip, billingCity, billingCountry, phone, items
            )
            if (invoiceResult.isSuccess) {
                val invoice = invoiceResult.getOrThrow()
                val orderResult = checkoutRepository.createPayPalOrder(
                    invoice.id, invoice.totalAmount
                )
                if (orderResult.isSuccess) {
                    val order = orderResult.getOrThrow()
                    val approvalUrl = order.getApprovalUrl()
                    _checkoutResult.value = Resource.Success(
                        CheckoutResult(
                            invoiceId = invoice.id,
                            totalAmount = invoice.totalAmount,
                            paypalOrderId = order.id,
                            paypalApprovalUrl = approvalUrl
                        )
                    )
                } else {
                    _checkoutResult.value =
                        Resource.Error(orderResult.exceptionOrNull()?.message ?: "PayPal order failed")
                }
            } else {
                _checkoutResult.value =
                    Resource.Error(invoiceResult.exceptionOrNull()?.message ?: "Checkout failed")
            }
        }
    }

    fun capturePayment(orderId: String, invoiceId: Int) {
        viewModelScope.launch {
            _checkoutResult.value = Resource.Loading
            val r = checkoutRepository.capturePayPalPayment(orderId, invoiceId)
            if (r.isSuccess) {
                clearCart()
                _checkoutResult.value = null
                _toastMessage.postValue("Payment successful")
            } else {
                _checkoutResult.value =
                    Resource.Error(r.exceptionOrNull()?.message ?: "Payment capture failed")
            }
        }
    }
}

data class CheckoutResult(
    val invoiceId: Int,
    val totalAmount: Double,
    val paypalOrderId: String? = null,
    val paypalApprovalUrl: String? = null
)
