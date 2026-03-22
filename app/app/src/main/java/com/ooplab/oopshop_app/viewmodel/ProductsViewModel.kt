package com.ooplab.oopshop_app.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.dto.ProductRecommendationItemDto
import com.ooplab.oopshop_app.data.repository.ProductRepository
import com.ooplab.oopshop_app.data.repository.Resource

/**
 * ViewModel for product list and product detail screens.
 * Exposes LiveData from ProductRepository for UI observation.
 */
class ProductsViewModel(
    private val productRepository: ProductRepository = ProductRepository()
) : ViewModel() {

    val products: LiveData<Resource<List<ProductDto>>> = productRepository.products
    val productDetail: LiveData<Resource<ProductDto>> = productRepository.productDetail
    val productRecommendations: LiveData<Resource<List<ProductRecommendationItemDto>>> =
        productRepository.productRecommendations

    fun loadProducts(
        query: String? = null,
        category: String? = null,
        page: Int? = null,
        sortBy: String? = null,
        sortOrder: String? = null
    ) {
        productRepository.loadProducts(
            query = query,
            category = category,
            page = page,
            sortBy = sortBy,
            sortOrder = sortOrder
        )
    }

    fun loadProductById(id: Int) {
        productRepository.loadProductById(id)
    }

    fun loadProductRecommendations(productId: Int) {
        productRepository.loadProductRecommendations(productId)
    }

    fun refreshProducts() {
        loadProducts()
    }
}
