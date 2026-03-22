package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.api.PaymentListItemDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.OrderStatusChip
import com.ooplab.oopshop_app.ui.components.formatOrderDate
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

private val cardShape = RoundedCornerShape(16.dp)

@Composable
fun AdminPaymentsScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val paymentsResource by adminViewModel.payments.observeAsState(initial = Resource.Loading)

    LaunchedEffect(Unit) {
        adminViewModel.loadPayments(forceRefresh = false)
    }

    when (paymentsResource) {
        is Resource.Loading -> Box(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface),
            contentAlignment = Alignment.Center
        ) {
            LoadingView(Modifier)
        }
        is Resource.Success -> {
            val list = (paymentsResource as Resource.Success<List<PaymentListItemDto>>).data
            LazyColumn(
                modifier = modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        text = "Payments",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Recorded transactions and PayPal activity",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 4.dp, bottom = 8.dp)
                    )
                }
                if (list.isEmpty()) {
                    item {
                        PaymentsEmptyPlaceholder()
                    }
                } else {
                    items(
                        items = list,
                        key = { p ->
                            "${p.id}_${p.createdAt}_${p.amount}"
                        }
                    ) { payment ->
                        AdminPaymentCard(payment = payment)
                    }
                }
            }
        }
        is Resource.Error -> Column(
            modifier = modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            Text(
                text = "Payments",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            PaymentsErrorBanner(message = (paymentsResource as Resource.Error).message)
        }
    }
}

@Composable
private fun PaymentsEmptyPlaceholder() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Payment,
                contentDescription = null,
                modifier = Modifier.size(44.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.65f)
            )
            Text(
                text = "No payments yet",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Completed checkouts will appear here",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun PaymentsErrorBanner(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.45f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Payment,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onErrorContainer
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}

@Composable
private fun AdminPaymentCard(
    payment: PaymentListItemDto,
    modifier: Modifier = Modifier
) {
    val displayAmount = payment.amount ?: payment.totalAmount ?: 0.0
    val customer = listOfNotNull(payment.firstName, payment.lastName)
        .joinToString(" ")
        .trim()
        .takeIf { it.isNotEmpty() }
        ?: payment.email

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = payment.id?.let { "Payment #$it" } ?: "Payment",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    payment.createdAt?.let { raw ->
                        Text(
                            text = formatOrderDate(raw),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Text(
                    text = "$${String.format("%.2f", displayAmount)}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            HorizontalDivider(
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
            )

            customer?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                payment.status?.let { OrderStatusChip(status = it) }
                payment.invoiceId?.let { inv ->
                    Text(
                        text = "Invoice #$inv",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            payment.method?.takeIf { it.isNotBlank() }?.let { method ->
                Text(
                    text = method.replaceFirstChar { c -> c.uppercase() },
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
