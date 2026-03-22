package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.NavType
import androidx.navigation.navArgument
import com.ooplab.oopshop_app.ui.navigation.AdminRoutes
import com.ooplab.oopshop_app.viewmodel.AdminViewModel
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel
import kotlinx.coroutines.launch

data class AdminDrawerItem(
    val route: String,
    val title: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)

private val adminDrawerItems = listOf(
    AdminDrawerItem(AdminRoutes.DASHBOARD, "Dashboard", Icons.Default.Dashboard),
    AdminDrawerItem(AdminRoutes.PRODUCTS, "Products", Icons.Default.ShoppingBag),
    AdminDrawerItem(AdminRoutes.INVENTORY, "Inventory", Icons.Default.Warning),
    AdminDrawerItem(AdminRoutes.USERS, "Users", Icons.Default.People),
    AdminDrawerItem(AdminRoutes.INVOICES, "Invoices", Icons.Default.ReceiptLong),
    AdminDrawerItem(AdminRoutes.REPORTS, "Reports", Icons.Default.Insights),
    AdminDrawerItem(AdminRoutes.PAYMENTS, "Payments", Icons.Default.Payment),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminHostScreen(
    adminViewModel: AdminViewModel,
    productsViewModel: ProductsViewModel,
    onBackToMain: () -> Unit,
    modifier: Modifier = Modifier
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: AdminRoutes.DASHBOARD
    val isDashboard = currentRoute == AdminRoutes.DASHBOARD
    val canPop = navController.previousBackStackEntry != null

    ModalNavigationDrawer(
        modifier = modifier.fillMaxSize(),
        drawerState = drawerState,
        drawerContent = {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(136.dp)
                        .background(MaterialTheme.colorScheme.primaryContainer)
                        .padding(20.dp)
                ) {
                    Column(
                        modifier = Modifier.align(Alignment.BottomStart),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.Store,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.height(32.dp)
                        )
                        Text(
                            "Admin",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            "OOPshop Manager",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 12.dp, vertical = 16.dp)
                ) {
                    NavigationDrawerItem(
                        icon = { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) },
                        label = { Text("Back to app") },
                        selected = false,
                        onClick = {
                            scope.launch { drawerState.close() }
                            onBackToMain()
                        },
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .padding(vertical = 4.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 4.dp),
                        color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                    )
                    adminDrawerItems.forEach { item ->
                        val selected = currentRoute == item.route
                        NavigationDrawerItem(
                            icon = { Icon(item.icon, contentDescription = null) },
                            label = { Text(item.title, style = MaterialTheme.typography.bodyLarge) },
                            selected = selected,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .padding(vertical = 2.dp)
                            ,
                            colors = NavigationDrawerItemDefaults.colors(
                                selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedIconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                                selectedTextColor = MaterialTheme.colorScheme.onPrimaryContainer,
                                unselectedContainerColor = androidx.compose.ui.graphics.Color.Transparent
                            )
                        )
                    }
                }
            }
        }
    ) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.surface,
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = when {
                                currentRoute == AdminRoutes.DASHBOARD -> "Dashboard"
                                currentRoute.startsWith("admin_product/") -> "Product"
                                currentRoute.startsWith("admin_user/") -> "User"
                                currentRoute.startsWith("admin_invoice/") -> "Order"
                                else -> adminDrawerItems.find { it.route == currentRoute }?.title ?: "Admin"
                            },
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                    },
                    navigationIcon = {
                        if (canPop) {
                            IconButton(onClick = { navController.popBackStack() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                            }
                        } else {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(Icons.Default.Menu, contentDescription = "Open menu")
                            }
                        }
                    },
                    actions = {
                        if (isDashboard) {
                            IconButton(onClick = { adminViewModel.loadDashboard(forceRefresh = true) }) {
                                Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                            }
                        } else if (canPop) {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(Icons.Default.Menu, contentDescription = "Open menu")
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface,
                        titleContentColor = MaterialTheme.colorScheme.onSurface,
                        actionIconContentColor = MaterialTheme.colorScheme.onSurface
                    )
                )
            }
        ) { padding ->
            AdminNavHost(
                navController = navController,
                adminViewModel = adminViewModel,
                productsViewModel = productsViewModel,
                onBackToMain = onBackToMain,
                contentPadding = padding
            )
        }
    }
}

@Composable
private fun AdminNavHost(
    navController: NavHostController,
    adminViewModel: AdminViewModel,
    productsViewModel: ProductsViewModel,
    onBackToMain: () -> Unit,
    contentPadding: PaddingValues
) {
    NavHost(
        navController = navController,
        startDestination = AdminRoutes.DASHBOARD,
        modifier = Modifier.padding(contentPadding)
    ) {
        composable(AdminRoutes.DASHBOARD) {
            AdminPanelScreen(
                adminViewModel = adminViewModel,
                onBack = onBackToMain,
                onNavigateToProducts = { navController.navigate(AdminRoutes.PRODUCTS) },
                onNavigateToInventory = { navController.navigate(AdminRoutes.INVENTORY) },
                onNavigateToUsers = { navController.navigate(AdminRoutes.USERS) },
                onNavigateToInvoices = { navController.navigate(AdminRoutes.INVOICES) },
                onNavigateToReports = { navController.navigate(AdminRoutes.REPORTS) },
                onNavigateToPayments = { navController.navigate(AdminRoutes.PAYMENTS) },
                onInvoiceClick = { id -> navController.navigate(AdminRoutes.invoiceDetail(id)) }
            )
        }
        composable(AdminRoutes.PRODUCTS) {
            AdminProductsScreen(
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() },
                onProductClick = { id -> navController.navigate(AdminRoutes.productDetail(id)) }
            )
        }
        composable(
            route = AdminRoutes.PRODUCT_DETAIL,
            arguments = listOf(navArgument("productId") { type = NavType.IntType })
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getInt("productId") ?: 0
            AdminProductDetailScreen(
                productId = productId,
                productsViewModel = productsViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(AdminRoutes.INVENTORY) {
            AdminInventoryScreen(
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() },
                onProductClick = { id -> navController.navigate(AdminRoutes.productDetail(id)) }
            )
        }
        composable(AdminRoutes.USERS) {
            AdminUsersScreen(
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() },
                onUserClick = { id -> navController.navigate(AdminRoutes.userDetail(id)) }
            )
        }
        composable(
            route = AdminRoutes.USER_DETAIL,
            arguments = listOf(navArgument("userId") { type = NavType.IntType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getInt("userId") ?: 0
            AdminUserDetailScreen(
                userId = userId,
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(AdminRoutes.INVOICES) {
            AdminInvoicesScreen(
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() },
                onInvoiceClick = { id -> navController.navigate(AdminRoutes.invoiceDetail(id)) }
            )
        }
        composable(
            route = AdminRoutes.INVOICE_DETAIL,
            arguments = listOf(navArgument("invoiceId") { type = NavType.IntType })
        ) { backStackEntry ->
            val invoiceId = backStackEntry.arguments?.getInt("invoiceId") ?: 0
            AdminInvoiceDetailScreen(
                invoiceId = invoiceId,
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(AdminRoutes.REPORTS) {
            AdminReportsScreen(
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable(AdminRoutes.PAYMENTS) {
            AdminPaymentsScreen(
                adminViewModel = adminViewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
