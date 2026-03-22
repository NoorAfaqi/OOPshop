package com.ooplab.oopshop_app.ui.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class RoutesTest {

    @Test
    fun product_detail_route_pattern() {
        assertEquals("product/7", Routes.productDetail(7))
    }

    @Test
    fun order_detail_route_pattern() {
        assertEquals("order/3", Routes.orderDetail(3))
    }

    @Test
    fun admin_routes_exist() {
        assertTrue(Routes.ADMIN_PANEL.isNotBlank())
        assertTrue(Routes.LOGIN.isNotBlank())
    }
}
