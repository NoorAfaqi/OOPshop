package com.ooplab.oopshop_app.ui.screens

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.ooplab.oopshop_app.data.local.CartItemEntity
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.PrimaryButton
import com.ooplab.oopshop_app.ui.components.showToast
import com.ooplab.oopshop_app.viewmodel.CartViewModel

@SuppressLint("DefaultLocale")
@Composable
fun CartScreen(
    cartViewModel: CartViewModel,
    onCheckoutClick: () -> Unit = {},
    @SuppressLint("ModifierParameter") modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val cartItems by cartViewModel.cartItems.observeAsState(initial = emptyList())
    val checkoutResult by cartViewModel.checkoutResult.observeAsState(initial = null)
    val toastMessage by cartViewModel.toastMessage.observeAsState(initial = null)
    var showPayPalWebView by remember { mutableStateOf(false) }

    LaunchedEffect(toastMessage) {
        toastMessage?.let { msg ->
            showToast(context, msg)
            cartViewModel.clearToastMessage()
        }
    }
    var pendingOrderId by remember { mutableStateOf<String?>(null) }
    var pendingInvoiceId by remember { mutableIntStateOf(0) }

    var pendingApprovalUrl by remember { mutableStateOf("") }

    LaunchedEffect(checkoutResult) {
        when (val result = checkoutResult) {
            is Resource.Success -> {
                val data = result.data
                if (data.paypalApprovalUrl != null && data.paypalOrderId != null) {
                    pendingApprovalUrl = data.paypalApprovalUrl
                    pendingOrderId = data.paypalOrderId
                    pendingInvoiceId = data.invoiceId
                    showPayPalWebView = true
                    cartViewModel.setCheckoutResult(null)
                }
            }
            else -> { }
        }
    }

    if (showPayPalWebView && pendingApprovalUrl.isNotEmpty() && pendingOrderId != null) {
        PayPalWebViewScreen(
            approvalUrl = pendingApprovalUrl,
            onApproved = {
                cartViewModel.capturePayment(pendingOrderId!!, pendingInvoiceId)
                showPayPalWebView = false
                pendingOrderId = null
                pendingApprovalUrl = ""
            },
            onDismiss = {
                showPayPalWebView = false
                pendingOrderId = null
                pendingApprovalUrl = ""
            }
        )
        return
    }

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        if (cartItems.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.ShoppingCart,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Your cart is empty",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(cartItems, key = { it.productId }) { item ->
                    CartItemRow(
                        item = item,
                        onQuantityChange = { qty -> cartViewModel.updateQuantity(item.productId, qty) },
                        onRemove = {
                            cartViewModel.removeFromCart(item.productId)
                            showToast(context, "Removed from cart")
                        }
                    )
                }
            }
            val total = cartItems.sumOf { it.price * it.quantity }
            Text(
                "Total: $${String.format("%.2f", total)}",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            PrimaryButton(
                text = "Checkout with PayPal",
                onClick = onCheckoutClick,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }

    when (checkoutResult) {
        is Resource.Loading -> LoadingView(modifier.fillMaxSize())
        else -> { }
    }
}

@SuppressLint("DefaultLocale")
@Composable
private fun CartItemRow(
    item: CartItemEntity,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (!item.imageUrl.isNullOrBlank()) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current).data(item.imageUrl).build(),
                    contentDescription = null,
                    modifier = Modifier.size(56.dp).clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(
                    modifier = Modifier.size(56.dp).clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surface)
                )
            }
            Spacer(modifier = Modifier.size(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(item.productName, style = MaterialTheme.typography.titleSmall)
                Text("$${String.format("%.2f", item.price)}", style = MaterialTheme.typography.bodySmall)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = { onQuantityChange((item.quantity - 1).coerceAtLeast(0)) }) {
                        Text("-")
                    }
                    Text("${item.quantity}", style = MaterialTheme.typography.bodyMedium)
                    TextButton(onClick = { onQuantityChange(item.quantity + 1) }) {
                        Text("+")
                    }
                }
            }
            IconButton(onClick = onRemove) {
                Icon(Icons.Default.Delete, contentDescription = "Remove")
            }
        }
    }
}

@Composable
private fun BillingDialog(
    onConfirm: (String, String, String, String, String, String, String?) -> Unit,
    onDismiss: () -> Unit
) {
    var first by remember { mutableStateOf("") }
    var last by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var zip by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
            Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Billing address", style = MaterialTheme.typography.titleLarge)
                OutlinedTextField(first, { first = it }, label = { Text("First name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(last, { last = it }, label = { Text("Last name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(street, { street = it }, label = { Text("Street") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(zip, { zip = it }, label = { Text("ZIP") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(city, { city = it }, label = { Text("City") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(country, { country = it }, label = { Text("Country") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(phone, { phone = it }, label = { Text("Phone (optional)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(modifier = Modifier.size(8.dp))
                    TextButton(onClick = {
                        if (first.isNotBlank() && last.isNotBlank() && street.isNotBlank() && zip.isNotBlank() && city.isNotBlank() && country.isNotBlank()) {
                            onConfirm(first, last, street, zip, city, country, phone.ifBlank { null })
                        }
                    }) { Text("Continue to PayPal") }
                }
            }
        }
    }
}

@Composable
private fun PayPalWebViewScreen(
    approvalUrl: String,
    onApproved: () -> Unit,
    onDismiss: () -> Unit
) {
    if (approvalUrl.isBlank()) return
    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Complete payment in PayPal", style = MaterialTheme.typography.titleMedium)
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
        AndroidView(
            factory = { ctx ->
                WebView(ctx).apply {
                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                            if (url != null && (url.contains("checkout/success") || url.contains("approved"))) {
                                onApproved()
                                return true
                            }
                            return false
                        }
                    }
                    settings.javaScriptEnabled = true
                    loadUrl(approvalUrl)
                }
            },
            modifier = Modifier.fillMaxSize().weight(1f)
        )
    }
}
