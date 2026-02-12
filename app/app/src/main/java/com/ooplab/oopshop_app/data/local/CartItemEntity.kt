package com.ooplab.oopshop_app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * SQLite (Room) entity for cart items.
 * Stores productId, quantity, and cached product details for offline display.
 */
@Entity(tableName = "cart_items")
data class CartItemEntity(
    @PrimaryKey val productId: Int,
    val quantity: Int,
    val productName: String,
    val price: Double,
    val imageUrl: String? = null
)
