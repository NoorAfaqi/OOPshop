package com.ooplab.oopshop_app.data.repository

import android.content.Context
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.data.local.CartItemEntity
import com.ooplab.oopshop_app.data.local.DatabaseProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class CartRepository(context: Context) {

    private val dao = DatabaseProvider.getDatabase(context).cartDao()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    val cartItems: Flow<List<CartItemEntity>> = dao.getAllFlow()

    fun addOrUpdate(product: ProductDto, quantity: Int = 1) {
        scope.launch {
            withContext(Dispatchers.IO) {
                val existing = dao.getByProductId(product.id)
                val newQty = (existing?.quantity ?: 0) + quantity
                dao.insert(
                    CartItemEntity(
                        productId = product.id,
                        quantity = newQty,
                        productName = product.name,
                        price = product.price,
                        imageUrl = product.imageUrl
                    )
                )
            }
        }
    }

    fun setQuantity(productId: Int, quantity: Int) {
        scope.launch {
            withContext(Dispatchers.IO) {
                val existing = dao.getByProductId(productId) ?: return@withContext
                if (quantity <= 0) dao.deleteByProductId(productId)
                else dao.insert(existing.copy(quantity = quantity))
            }
        }
    }

    fun remove(productId: Int) {
        scope.launch {
            withContext(Dispatchers.IO) { dao.deleteByProductId(productId) }
        }
    }

    suspend fun getAllItems(): List<CartItemEntity> = withContext(Dispatchers.IO) { dao.getAll() }

    suspend fun clearCart() = withContext(Dispatchers.IO) { dao.deleteAll() }

    suspend fun getItemCount(): Int = withContext(Dispatchers.IO) { dao.getCount() }
}
