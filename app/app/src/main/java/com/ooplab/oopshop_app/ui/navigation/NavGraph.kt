package com.ooplab.oopshop_app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.ooplab.oopshop_app.ui.screens.AdminHostScreen
import com.ooplab.oopshop_app.ui.screens.BillingScreen
import com.ooplab.oopshop_app.ui.screens.ChangePasswordScreen
import com.ooplab.oopshop_app.ui.screens.CurrentOrdersScreen
import com.ooplab.oopshop_app.ui.screens.AuthScreen
import com.ooplab.oopshop_app.ui.screens.MainScreen
import com.ooplab.oopshop_app.ui.screens.OrderDetailScreen
import com.ooplab.oopshop_app.ui.screens.OrderHistoryScreen
import com.ooplab.oopshop_app.ui.screens.ProductDetailScreen
import com.ooplab.oopshop_app.ui.screens.ProfileSettingsScreen
import com.ooplab.oopshop_app.viewmodel.AccountViewModel
import com.ooplab.oopshop_app.viewmodel.AdminViewModel
import com.ooplab.oopshop_app.viewmodel.AuthViewModel
import com.ooplab.oopshop_app.viewmodel.CartViewModel
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel

object Routes {
    const val MAIN = "main"
    const val PRODUCT_DETAIL = "product/{productId}"
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val BILLING = "billing"
    const val CURRENT_ORDERS = "current_orders"
    const val ORDER_HISTORY = "order_history"
    const val ORDER_DETAIL = "order/{orderId}"
    const val PROFILE_SETTINGS = "profile_settings"
    const val CHANGE_PASSWORD = "change_password"
    const val ADMIN_PANEL = "admin_panel"
    const val ADMIN_PRODUCTS = "admin_products"
    const val ADMIN_PRODUCT_DETAIL = "admin_product/{productId}"
    const val ADMIN_INVENTORY = "admin_inventory"
    const val ADMIN_USERS = "admin_users"
    const val ADMIN_USER_DETAIL = "admin_user/{userId}"
    const val ADMIN_INVOICES = "admin_invoices"
    const val ADMIN_INVOICE_DETAIL = "admin_invoice/{invoiceId}"
    const val ADMIN_REPORTS = "admin_reports"
    const val ADMIN_PAYMENTS = "admin_payments"

    fun productDetail(productId: Int) = "product/$productId"
    fun orderDetail(orderId: Int) = "order/$orderId"
    fun adminProductDetail(productId: Int) = "admin_product/$productId"
    fun adminUserDetail(userId: Int) = "admin_user/$userId"
    fun adminInvoiceDetail(invoiceId: Int) = "admin_invoice/$invoiceId"
}

/** Inner routes for admin drawer (nested NavHost inside AdminHostScreen). */
object AdminRoutes {
    const val DASHBOARD = "admin_dashboard"
    const val PRODUCTS = "admin_products"
    const val PRODUCT_DETAIL = "admin_product/{productId}"
    const val INVENTORY = "admin_inventory"
    const val USERS = "admin_users"
    const val USER_DETAIL = "admin_user/{userId}"
    const val INVOICES = "admin_invoices"
    const val INVOICE_DETAIL = "admin_invoice/{invoiceId}"
    const val REPORTS = "admin_reports"
    const val PAYMENTS = "admin_payments"

    fun productDetail(productId: Int) = "admin_product/$productId"
    fun userDetail(userId: Int) = "admin_user/$userId"
    fun invoiceDetail(invoiceId: Int) = "admin_invoice/$invoiceId"
}

@Composable
fun OOPShopNavGraph(
    navController: NavHostController = rememberNavController(),
    productsViewModel: ProductsViewModel,
    authViewModel: AuthViewModel,
    cartViewModel: CartViewModel,
    accountViewModel: AccountViewModel,
    adminViewModel: AdminViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Routes.MAIN
    ) {
        composable(Routes.MAIN) {
            MainScreen(
                productsViewModel = productsViewModel,
                authViewModel = authViewModel,
                cartViewModel = cartViewModel,
                accountViewModel = accountViewModel,
                adminViewModel = adminViewModel,
                onProductClick = { id ->
                    navController.navigate(Routes.productDetail(id))
                },
                onLoginClick = { navController.navigate(Routes.LOGIN) },
                onProfileAvatarClick = { },
                onCheckoutClick = { navController.navigate(Routes.BILLING) },
                onCurrentOrdersClick = { navController.navigate(Routes.CURRENT_ORDERS) },
                onOrderHistoryClick = { navController.navigate(Routes.ORDER_HISTORY) },
                onProfileSettingsClick = { navController.navigate(Routes.PROFILE_SETTINGS) },
                onAdminPanelClick = { navController.navigate(Routes.ADMIN_PANEL) }
            )
        }
        composable(
            route = Routes.PRODUCT_DETAIL,
            arguments = listOf(navArgument("productId") { type = NavType.IntType })
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getInt("productId") ?: 0
            ProductDetailScreen(
                productId = productId,
                viewModel = productsViewModel,
                cartViewModel = cartViewModel,
                onBack = { navController.popBackStack() },
                onRecommendedProductClick = { id ->
                    navController.navigate(Routes.productDetail(id))
                }
            )
        }
        composable(Routes.LOGIN) {
            AuthScreen(
                viewModel = authViewModel,
                onAuthSuccess = {
                    navController.navigate(Routes.MAIN) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.BILLING) {
            BillingScreen(
                authViewModel = authViewModel,
                cartViewModel = cartViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.CURRENT_ORDERS) {
            CurrentOrdersScreen(
                accountViewModel = accountViewModel,
                onBack = { navController.popBackStack() },
                onOrderClick = { id -> navController.navigate(Routes.orderDetail(id)) }
            )
        }
        composable(Routes.ORDER_HISTORY) {
            OrderHistoryScreen(
                accountViewModel = accountViewModel,
                onBack = { navController.popBackStack() },
                onOrderClick = { id -> navController.navigate(Routes.orderDetail(id)) }
            )
        }
        composable(
            route = Routes.ORDER_DETAIL,
            arguments = listOf(navArgument("orderId") { type = NavType.IntType })
        ) { backStackEntry ->
            val orderId = backStackEntry.arguments?.getInt("orderId") ?: 0
            OrderDetailScreen(
                orderId = orderId,
                accountViewModel = accountViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.PROFILE_SETTINGS) {
            ProfileSettingsScreen(
                authViewModel = authViewModel,
                accountViewModel = accountViewModel,
                onBack = { navController.popBackStack() },
                onChangePasswordClick = { navController.navigate(Routes.CHANGE_PASSWORD) }
            )
        }
        composable(Routes.CHANGE_PASSWORD) {
            ChangePasswordScreen(
                authViewModel = authViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Routes.ADMIN_PANEL) {
            AdminHostScreen(
                adminViewModel = adminViewModel,
                productsViewModel = productsViewModel,
                onBackToMain = { navController.popBackStack() }
            )
        }
    }
}
