package com.ooplab.oopshop_app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.ooplab.oopshop_app.data.api.PaymentListItemDto
import com.ooplab.oopshop_app.data.api.BarcodeRequest
import com.ooplab.oopshop_app.data.api.CreateProductRequest
import com.ooplab.oopshop_app.data.api.FromBarcodeResponse
import com.ooplab.oopshop_app.data.api.StockAdjustmentRequest
import com.ooplab.oopshop_app.data.dto.InvoiceDetailDto
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.dto.ReportDto
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.network.RetrofitClient
import com.ooplab.oopshop_app.data.repository.Resource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * ViewModel for admin panel: overview, reports, invoices, users, products, inventory, payments.
 */
class AdminViewModel(application: Application) : AndroidViewModel(application) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _report = MutableLiveData<Resource<ReportDto>>()
    val report: LiveData<Resource<ReportDto>> = _report

    private val _allInvoices = MutableLiveData<Resource<List<InvoiceListItemDto>>>()
    val allInvoices: LiveData<Resource<List<InvoiceListItemDto>>> = _allInvoices

    private val _users = MutableLiveData<Resource<List<UserDto>>>()
    val users: LiveData<Resource<List<UserDto>>> = _users

    private val _products = MutableLiveData<Resource<List<ProductDto>>>()
    val products: LiveData<Resource<List<ProductDto>>> = _products

    private val _lowStockProducts = MutableLiveData<Resource<List<ProductDto>>>()
    val lowStockProducts: LiveData<Resource<List<ProductDto>>> = _lowStockProducts

    private val _barcodeSuggestion = MutableLiveData<Resource<FromBarcodeResponse>>()
    val barcodeSuggestion: LiveData<Resource<FromBarcodeResponse>> = _barcodeSuggestion

    private val _createProductResult = MutableLiveData<Resource<ProductDto>?>()
    val createProductResult: LiveData<Resource<ProductDto>?> = _createProductResult

    private val _adjustStockResult = MutableLiveData<Resource<ProductDto>?>()
    val adjustStockResult: LiveData<Resource<ProductDto>?> = _adjustStockResult

    private val _payments = MutableLiveData<Resource<List<PaymentListItemDto>>>()
    val payments: LiveData<Resource<List<PaymentListItemDto>>> = _payments

    private val _invoiceDetail = MutableLiveData<Resource<InvoiceDetailDto>>()
    val invoiceDetail: LiveData<Resource<InvoiceDetailDto>> = _invoiceDetail

    private val _userDetail = MutableLiveData<Resource<UserDto>>()
    val userDetail: LiveData<Resource<UserDto>> = _userDetail

    fun loadReport(from: String? = null, to: String? = null, forceRefresh: Boolean = false) {
        if (!forceRefresh && _report.value is Resource.Success) return
        _report.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.reportsApi.getReport(from = from, to = to)
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _report.value = Resource.Success(body.data)
                            body != null -> _report.value = Resource.Error(body.message ?: "Request failed")
                            else -> _report.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _report.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _report.value = Resource.Error(e.message ?: "Failed to load report", e)
            }
        }
    }

    fun loadAllInvoices(forceRefresh: Boolean = false) {
        if (!forceRefresh && _allInvoices.value is Resource.Success) return
        _allInvoices.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { RetrofitClient.invoicesApi.getAllInvoices() }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() ->
                                _allInvoices.value = Resource.Success(body.data ?: emptyList())
                            body != null -> _allInvoices.value = Resource.Error(body.message ?: "Request failed")
                            else -> _allInvoices.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _allInvoices.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _allInvoices.value = Resource.Error(e.message ?: "Failed to load invoices", e)
            }
        }
    }

    fun loadUsers(forceRefresh: Boolean = false) {
        if (!forceRefresh && _users.value is Resource.Success) return
        _users.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { RetrofitClient.usersApi.getUsers() }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() ->
                                _users.value = Resource.Success(body.data ?: emptyList())
                            body != null -> _users.value = Resource.Error(body.message ?: "Request failed")
                            else -> _users.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _users.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _users.value = Resource.Error(e.message ?: "Failed to load users", e)
            }
        }
    }

    fun loadProducts(query: String? = null, forceRefresh: Boolean = false) {
        if (!forceRefresh && _products.value is Resource.Success && query.isNullOrBlank()) return
        _products.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.productApi.getProducts(query = query)
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() ->
                                _products.value = Resource.Success(body.data ?: emptyList())
                            body != null -> _products.value = Resource.Error(body.message ?: "Request failed")
                            else -> _products.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _products.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _products.value = Resource.Error(e.message ?: "Failed to load products", e)
            }
        }
    }

    fun loadLowStockProducts(forceRefresh: Boolean = false) {
        if (!forceRefresh && _lowStockProducts.value is Resource.Success) return
        _lowStockProducts.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.productApi.getLowStockProducts()
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() ->
                                _lowStockProducts.value = Resource.Success(body.data ?: emptyList())
                            body != null -> _lowStockProducts.value = Resource.Error(body.message ?: "Request failed")
                            else -> _lowStockProducts.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _lowStockProducts.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _lowStockProducts.value = Resource.Error(e.message ?: "Failed to load low stock", e)
            }
        }
    }

    fun fetchProductFromBarcode(barcode: String) {
        val cleanBarcode = barcode.trim()
        if (cleanBarcode.isEmpty()) {
            _barcodeSuggestion.value = Resource.Error("Barcode is required")
            return
        }
        _barcodeSuggestion.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.productApi.fetchProductFromBarcode(BarcodeRequest(cleanBarcode))
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _barcodeSuggestion.value = Resource.Success(body.data)
                            body != null -> _barcodeSuggestion.value = Resource.Error(body.message ?: "Request failed")
                            else -> _barcodeSuggestion.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _barcodeSuggestion.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _barcodeSuggestion.value = Resource.Error(e.message ?: "Failed to fetch from barcode", e)
            }
        }
    }

    fun createProduct(
        name: String,
        price: Double,
        brand: String? = null,
        imageUrl: String? = null,
        category: String? = null,
        description: String? = null,
        stockQuantity: Int = 0,
        barcode: String? = null
    ) {
        _createProductResult.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.productApi.createProduct(
                        CreateProductRequest(
                            name = name,
                            price = price,
                            brand = brand?.takeIf { it.isNotBlank() },
                            image_url = imageUrl?.takeIf { it.isNotBlank() },
                            category = category?.takeIf { it.isNotBlank() },
                            description = description?.takeIf { it.isNotBlank() },
                            stock_quantity = stockQuantity,
                            open_food_facts_barcode = barcode?.takeIf { it.isNotBlank() }
                        )
                    )
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null -> {
                                _createProductResult.value = Resource.Success(body.data)
                                loadProducts(forceRefresh = true)
                            }
                            body != null -> _createProductResult.value = Resource.Error(body.message ?: "Request failed")
                            else -> _createProductResult.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _createProductResult.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _createProductResult.value = Resource.Error(e.message ?: "Failed to create product", e)
            }
        }
    }

    fun clearCreateProductResult() {
        _createProductResult.value = null
    }

    fun addStock(productId: Int, quantityToAdd: Int, reason: String? = null) {
        if (quantityToAdd <= 0) {
            _adjustStockResult.value = Resource.Error("Quantity must be greater than 0")
            return
        }
        _adjustStockResult.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    RetrofitClient.productApi.adjustStock(
                        productId,
                        StockAdjustmentRequest(
                            quantity_change = quantityToAdd,
                            change_type = "adjustment",
                            reason = reason?.takeIf { it.isNotBlank() }
                        )
                    )
                }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null -> {
                                _adjustStockResult.value = Resource.Success(body.data)
                                loadLowStockProducts(forceRefresh = true)
                                loadProducts(forceRefresh = true)
                            }
                            body != null -> _adjustStockResult.value = Resource.Error(body.message ?: "Request failed")
                            else -> _adjustStockResult.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _adjustStockResult.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _adjustStockResult.value = Resource.Error(e.message ?: "Failed to add stock", e)
            }
        }
    }

    fun clearAdjustStockResult() {
        _adjustStockResult.value = null
    }

    fun loadPayments(forceRefresh: Boolean = false) {
        if (!forceRefresh && _payments.value is Resource.Success) return
        _payments.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { RetrofitClient.paymentApi.getPayments() }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() ->
                                _payments.value = Resource.Success(body.data ?: emptyList())
                            body != null -> _payments.value = Resource.Error(body.message ?: "Request failed")
                            else -> _payments.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _payments.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _payments.value = Resource.Error(e.message ?: "Failed to load payments", e)
            }
        }
    }

    fun loadInvoiceById(id: Int) {
        _invoiceDetail.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { RetrofitClient.invoicesApi.getInvoiceById(id) }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _invoiceDetail.value = Resource.Success(body.data)
                            body != null -> _invoiceDetail.value = Resource.Error(body.message ?: "Request failed")
                            else -> _invoiceDetail.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _invoiceDetail.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _invoiceDetail.value = Resource.Error(e.message ?: "Failed to load invoice", e)
            }
        }
    }

    fun loadUserById(id: Int) {
        _userDetail.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { RetrofitClient.usersApi.getUserById(id) }
                when {
                    response.isSuccessful -> {
                        val body = response.body()
                        when {
                            body != null && body.isSuccess() && body.data != null ->
                                _userDetail.value = Resource.Success(body.data)
                            body != null -> _userDetail.value = Resource.Error(body.message ?: "Request failed")
                            else -> _userDetail.value = Resource.Error("Empty response")
                        }
                    }
                    else -> _userDetail.value = Resource.Error("${response.code()}: ${response.message()}")
                }
            } catch (e: Exception) {
                _userDetail.value = Resource.Error(e.message ?: "Failed to load user", e)
            }
        }
    }

    /** Load dashboard data in parallel. Skips fetches when already cached unless forceRefresh. */
    fun loadDashboard(forceRefresh: Boolean = false) {
        val needReport = forceRefresh || _report.value !is Resource.Success
        val needInvoices = forceRefresh || _allInvoices.value !is Resource.Success
        val needUsers = forceRefresh || _users.value !is Resource.Success
        val needProducts = forceRefresh || _products.value !is Resource.Success
        val needLowStock = forceRefresh || _lowStockProducts.value !is Resource.Success
        if (!needReport && !needInvoices && !needUsers && !needProducts && !needLowStock) return

        if (needReport) _report.value = Resource.Loading
        if (needInvoices) _allInvoices.value = Resource.Loading
        if (needUsers) _users.value = Resource.Loading
        if (needProducts) _products.value = Resource.Loading
        if (needLowStock) _lowStockProducts.value = Resource.Loading

        scope.launch {
            val dReport = if (needReport) async { runReport() } else null
            val dInvoices = if (needInvoices) async { runAllInvoices() } else null
            val dUsers = if (needUsers) async { runUsers() } else null
            val dProducts = if (needProducts) async { runProducts() } else null
            val dLowStock = if (needLowStock) async { runLowStock() } else null
            dReport?.let { _report.value = it.await() }
            dInvoices?.let { _allInvoices.value = it.await() }
            dUsers?.let { _users.value = it.await() }
            dProducts?.let { _products.value = it.await() }
            dLowStock?.let { _lowStockProducts.value = it.await() }
        }
    }

    private suspend fun runReport(): Resource<ReportDto> = withContext(Dispatchers.IO) {
        try {
            val response = RetrofitClient.reportsApi.getReport(from = null, to = null)
            when {
                response.isSuccessful -> {
                    val body = response.body()
                    when {
                        body != null && body.isSuccess() && body.data != null -> Resource.Success(body.data)
                        body != null -> Resource.Error(body.message ?: "Request failed")
                        else -> Resource.Error("Empty response")
                    }
                }
                else -> Resource.Error("${response.code()}: ${response.message()}")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to load report", e)
        }
    }

    private suspend fun runAllInvoices(): Resource<List<InvoiceListItemDto>> = withContext(Dispatchers.IO) {
        try {
            val response = RetrofitClient.invoicesApi.getAllInvoices()
            when {
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
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to load invoices", e)
        }
    }

    private suspend fun runUsers(): Resource<List<UserDto>> = withContext(Dispatchers.IO) {
        try {
            val response = RetrofitClient.usersApi.getUsers()
            when {
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
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to load users", e)
        }
    }

    private suspend fun runProducts(): Resource<List<ProductDto>> = withContext(Dispatchers.IO) {
        try {
            val response = RetrofitClient.productApi.getProducts(query = null)
            when {
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
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to load products", e)
        }
    }

    private suspend fun runLowStock(): Resource<List<ProductDto>> = withContext(Dispatchers.IO) {
        try {
            val response = RetrofitClient.productApi.getLowStockProducts()
            when {
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
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Failed to load low stock", e)
        }
    }
}
