package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.UserAvatar
import com.ooplab.oopshop_app.viewmodel.AuthViewModel
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    productsViewModel: ProductsViewModel,
    authViewModel: AuthViewModel,
    cartViewModel: com.ooplab.oopshop_app.viewmodel.CartViewModel,
    accountViewModel: com.ooplab.oopshop_app.viewmodel.AccountViewModel,
    adminViewModel: com.ooplab.oopshop_app.viewmodel.AdminViewModel,
    onProductClick: (Int) -> Unit,
    onLoginClick: () -> Unit,
    onProfileAvatarClick: () -> Unit = {},
    onCheckoutClick: () -> Unit = {},
    onCurrentOrdersClick: () -> Unit = {},
    onOrderHistoryClick: () -> Unit = {},
    onProfileSettingsClick: () -> Unit = {},
    onAdminPanelClick: () -> Unit = {}
) {
    var selectedIndex by rememberSaveable { mutableIntStateOf(0) }
    val currentUser by authViewModel.currentUser.observeAsState(initial = null)
    val cartItems by cartViewModel.cartItems.observeAsState(initial = emptyList())
    val cartCount = cartItems.sumOf { it.quantity }
    val isLoggedIn = authViewModel.isLoggedIn()
    val displayName = when (val u = currentUser) {
        is Resource.Success -> userDisplayName(u.data)
        else -> ""
    }
    // Show avatar when logged in (use "?" if user not loaded yet to avoid rate-limit spam)
    val avatarDisplayName = if (isLoggedIn) displayName.ifEmpty { "?" } else ""

    // Load current user only once when we have token but no user data (avoids 429 rate limit)
    LaunchedEffect(isLoggedIn, currentUser) {
        if (isLoggedIn && currentUser == null) authViewModel.loadCurrentUser()
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text("OOPshop", style = MaterialTheme.typography.titleLarge) },
                actions = {
                    if (isLoggedIn && avatarDisplayName.isNotEmpty()) {
                        IconButton(onClick = onProfileAvatarClick) {
                            UserAvatar(
                                displayName = avatarDisplayName,
                                imageUrl = null,
                                size = 40.dp
                            )
                        }
                    } else {
                        TextButton(onClick = onLoginClick) {
                            Text("Login")
                        }
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedIndex == 0,
                    onClick = { selectedIndex = 0 },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        selectedTextColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                        unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                )
                NavigationBarItem(
                    selected = selectedIndex == 1,
                    onClick = { selectedIndex = 1 },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (cartCount > 0) {
                                    Badge { Text(if (cartCount > 99) "99+" else "$cartCount") }
                                }
                            }
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
                        }
                    },
                    label = { Text("Cart") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        selectedTextColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                        unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                )
                NavigationBarItem(
                    selected = selectedIndex == 2,
                    onClick = { selectedIndex = 2 },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        selectedTextColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                        unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (selectedIndex) {
                0 -> ShopScreen(
                    viewModel = productsViewModel,
                    onProductClick = onProductClick,
                    onLoginClick = onLoginClick,
                    modifier = Modifier.fillMaxSize(),
                    showTopBar = false
                )
                1 -> CartScreen(
                    cartViewModel = cartViewModel,
                    onCheckoutClick = onCheckoutClick,
                    modifier = Modifier.fillMaxSize()
                )
                2 -> ProfileScreen(
                    authViewModel = authViewModel,
                    onLoginClick = onLoginClick,
                    onCurrentOrdersClick = onCurrentOrdersClick,
                    onOrderHistoryClick = onOrderHistoryClick,
                    onProfileSettingsClick = onProfileSettingsClick,
                    onAdminPanelClick = onAdminPanelClick,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}

private fun userDisplayName(user: UserDto): String {
    val first = user.firstName?.trim() ?: ""
    val last = user.lastName?.trim() ?: ""
    return if (first.isNotEmpty() || last.isNotEmpty()) "$first $last".trim()
    else user.email
}