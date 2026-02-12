package com.ooplab.oopshop_app.ui.screens

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.platform.LocalContext
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.PrimaryButton
import com.ooplab.oopshop_app.ui.components.showToast
import com.ooplab.oopshop_app.viewmodel.AuthViewModel
import com.ooplab.oopshop_app.viewmodel.CartViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BillingScreen(
    authViewModel: AuthViewModel,
    cartViewModel: CartViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val currentUser by authViewModel.currentUser.observeAsState(initial = null)
    val checkoutResult by cartViewModel.checkoutResult.observeAsState(initial = null)
    val toastMessage by cartViewModel.toastMessage.observeAsState(initial = null)

    LaunchedEffect(toastMessage) {
        toastMessage?.let { msg ->
            showToast(context, msg)
            cartViewModel.clearToastMessage()
        }
    }

    var first by remember { mutableStateOf("") }
    var last by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var zip by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    var autofillDone by remember { mutableStateOf(false) }
    LaunchedEffect(currentUser, autofillDone) {
        if (autofillDone) return@LaunchedEffect
        val user = (currentUser as? Resource.Success)?.data ?: return@LaunchedEffect
        first = user.firstName?.trim() ?: ""
        last = user.lastName?.trim() ?: ""
        phone = user.phone?.trim() ?: ""
        autofillDone = true
    }

    var showPayPalWebView by remember { mutableStateOf(false) }
    var pendingOrderId by remember { mutableStateOf<String?>(null) }
    var pendingInvoiceId by remember { mutableStateOf(0) }
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
                onBack()
            },
            onDismiss = {
                showPayPalWebView = false
                pendingOrderId = null
                pendingApprovalUrl = ""
                onBack()
            }
        )
        return
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text("Billing address") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                "Enter your billing details. If you're logged in, name and phone are prefilled.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            OutlinedTextField(
                value = first,
                onValueChange = { first = it },
                label = { Text("First name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = last,
                onValueChange = { last = it },
                label = { Text("Last name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = street,
                onValueChange = { street = it },
                label = { Text("Street") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = zip,
                onValueChange = { zip = it },
                label = { Text("ZIP") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = city,
                onValueChange = { city = it },
                label = { Text("City") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = country,
                onValueChange = { country = it },
                label = { Text("Country") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone (optional)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.size(16.dp))
            PrimaryButton(
                text = "Continue to PayPal",
                onClick = {
                    if (first.isNotBlank() && last.isNotBlank() && street.isNotBlank() &&
                        zip.isNotBlank() && city.isNotBlank() && country.isNotBlank()
                    ) {
                        cartViewModel.startCheckout(
                            first, last, street, zip, city, country,
                            phone.ifBlank { null }
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }

    when (checkoutResult) {
        is Resource.Loading -> LoadingView(modifier = Modifier.fillMaxSize())
        else -> { }
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
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
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
