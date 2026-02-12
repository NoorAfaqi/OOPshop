package com.ooplab.oopshop_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ooplab.oopshop_app.data.prefs.SessionManager
import com.ooplab.oopshop_app.ui.navigation.OOPShopNavGraph
import com.ooplab.oopshop_app.ui.theme.OOPShop_AppTheme
import com.ooplab.oopshop_app.viewmodel.AccountViewModel
import com.ooplab.oopshop_app.viewmodel.AdminViewModel
import com.ooplab.oopshop_app.viewmodel.AuthViewModel
import com.ooplab.oopshop_app.viewmodel.CartViewModel
import com.ooplab.oopshop_app.viewmodel.ProductsViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SessionManager.init(applicationContext)
        enableEdgeToEdge()
        setContent {
            OOPShop_AppTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val productsViewModel: ProductsViewModel = viewModel()
                    val authViewModel: AuthViewModel = viewModel()
                    val cartViewModel: CartViewModel = viewModel()
                    val accountViewModel: AccountViewModel = viewModel()
                    val adminViewModel: AdminViewModel = viewModel()
                    OOPShopNavGraph(
                        productsViewModel = productsViewModel,
                        authViewModel = authViewModel,
                        cartViewModel = cartViewModel,
                        accountViewModel = accountViewModel,
                        adminViewModel = adminViewModel
                    )
                }
            }
        }
    }
}
