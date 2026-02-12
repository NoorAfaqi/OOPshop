package com.ooplab.oopshop_app.data.repository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.ooplab.oopshop_app.data.api.ApiResponse
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Response

/**
 * Repository for product data. Fetches from backend API and exposes LiveData.
 * Single source of truth for product list and product detail.
 */
class ProductRepository {

    private val api = RetrofitClient.productApi
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _products = MutableLiveData<Resource<List<ProductDto>>>()
    val products: LiveData<Resource<List<ProductDto>>> = _products

    private val _productDetail = MutableLiveData<Resource<ProductDto>>()
    val productDetail: LiveData<Resource<ProductDto>> = _productDetail

    fun loadProducts(
        query: String? = null,
        category: String? = null,
        page: Int? = null,
        limit: Int? = null,
        sortBy: String? = null,
        sortOrder: String? = null
    ) {
        _products.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    api.getProducts(
                        query = query,
                        category = category,
                        page = page,
                        limit = limit,
                        sortBy = sortBy,
                        sortOrder = sortOrder
                    )
                }
                _products.value = handleProductListResponse(response)
            } catch (e: Exception) {
                _products.value = Resource.Error(e.message ?: "Unknown error", e)
            }
        }
    }

    fun loadProductById(id: Int) {
        _productDetail.value = Resource.Loading
        scope.launch {
            try {
                val response = withContext(Dispatchers.IO) { api.getProductById(id) }
                _productDetail.value = handleProductResponse(response)
            } catch (e: Exception) {
                _productDetail.value = Resource.Error(e.message ?: "Unknown error", e)
            }
        }
    }

    private fun handleProductListResponse(response: Response<ApiResponse<List<ProductDto>>>): Resource<List<ProductDto>> {
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

    private fun handleProductResponse(response: Response<ApiResponse<ProductDto>>): Resource<ProductDto> {
        return when {
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
    }
}
