package com.ooplab.oopshop_app.ui.navigation

import org.junit.Assert.assertEquals
import org.junit.Test

class AdminRoutesTest {

    @Test
    fun product_detail_path() {
        assertEquals("admin_product/5", AdminRoutes.productDetail(5))
    }

    @Test
    fun user_detail_path() {
        assertEquals("admin_user/2", AdminRoutes.userDetail(2))
    }

    @Test
    fun invoice_detail_path() {
        assertEquals("admin_invoice/9", AdminRoutes.invoiceDetail(9))
    }
}
