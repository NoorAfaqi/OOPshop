package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import com.ooplab.oopshop_app.data.dto.ReportDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

private val cardShape = RoundedCornerShape(16.dp)
private val statCardShape = RoundedCornerShape(12.dp)

@Composable
fun AdminPanelScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    onNavigateToProducts: () -> Unit = {},
    onNavigateToInventory: () -> Unit = {},
    onNavigateToUsers: () -> Unit = {},
    onNavigateToInvoices: () -> Unit = {},
    onNavigateToReports: () -> Unit = {},
    onNavigateToPayments: () -> Unit = {},
    onInvoiceClick: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val reportResource by adminViewModel.report.observeAsState(initial = Resource.Loading)
    val invoicesResource by adminViewModel.allInvoices.observeAsState(initial = Resource.Loading)
    val usersResource by adminViewModel.users.observeAsState(initial = Resource.Loading)
    val productsResource by adminViewModel.products.observeAsState(initial = Resource.Loading)
    val lowStockResource by adminViewModel.lowStockProducts.observeAsState(initial = Resource.Loading)

    LaunchedEffect(Unit) {
        adminViewModel.loadDashboard()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Quick stats
            Text(
                "Quick stats",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val userCount = (usersResource as? Resource.Success)?.data?.size ?: null
                val productCount = (productsResource as? Resource.Success)?.data?.size ?: null
                val lowStockCount = (lowStockResource as? Resource.Success)?.data?.size ?: null
                val usersLoading = usersResource is Resource.Loading
                val productsLoading = productsResource is Resource.Loading
                val lowStockLoading = lowStockResource is Resource.Loading
                QuickStatCard(
                    title = "Users",
                    count = userCount,
                    isLoading = usersLoading,
                    gradientColors = listOf(0xFF6650a4.toInt(), 0xFF7D5260.toInt()),
                    onClick = onNavigateToUsers,
                    modifier = Modifier.weight(1f)
                )
                QuickStatCard(
                    title = "Products",
                    count = productCount,
                    isLoading = productsLoading,
                    gradientColors = listOf(0xFF1976D2.toInt(), 0xFF42A5F5.toInt()),
                    onClick = onNavigateToProducts,
                    modifier = Modifier.weight(1f)
                )
                QuickStatCard(
                    title = "Low stock",
                    count = lowStockCount,
                    isLoading = lowStockLoading,
                    gradientColors = listOf(0xFFE65100.toInt(), 0xFFFF9800.toInt()),
                    onClick = onNavigateToInventory,
                    modifier = Modifier.weight(1f)
                )
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 4.dp),
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
            )

            // Sales report
            Text(
                "Sales report",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            when (reportResource) {
                is Resource.Loading -> Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) { LoadingView(Modifier) }
                is Resource.Success -> ReportSummaryCard(report = (reportResource as Resource.Success<ReportDto>).data)
                is Resource.Error -> Text(
                    (reportResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 4.dp),
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
            )

            // Recent orders
            Text(
                "Recent orders",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            when (invoicesResource) {
                is Resource.Loading -> Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) { LoadingView(Modifier) }
                is Resource.Success -> {
                    val list = (invoicesResource as Resource.Success<List<InvoiceListItemDto>>).data
                    if (list.isEmpty()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = cardShape,
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        ) {
                            Text(
                                "No orders yet",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(20.dp)
                            )
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            list.take(5).forEach { inv ->
                                AdminInvoiceCard(invoice = inv, onClick = { onInvoiceClick(inv.id) })
                            }
                            if (list.size > 5) {
                                Text(
                                    "See all (${list.size}) →",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier
                                        .padding(top = 4.dp)
                                        .clickable { onNavigateToInvoices() }
                                )
                            }
                        }
                    }
                }
                is Resource.Error -> Text(
                    (invoicesResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
}

@Composable
private fun QuickStatCard(
    title: String,
    count: Int?,
    isLoading: Boolean,
    gradientColors: List<Int>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = gradientColors.map { androidx.compose.ui.graphics.Color(it) }
    Card(
        modifier = modifier
            .clip(statCardShape)
            .clickable(onClick = onClick),
        shape = statCardShape,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(colors))
                .padding(16.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(28.dp),
                        color = androidx.compose.ui.graphics.Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        count?.toString() ?: "—",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = androidx.compose.ui.graphics.Color.White
                    )
                }
                Text(
                    title,
                    style = MaterialTheme.typography.labelMedium,
                    color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.9f)
                )
            }
        }
    }
}

@Composable
private fun ReportSummaryCard(report: ReportDto, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            report.totalSales?.let {
                Text("Total sales: $${String.format("%.2f", it)}", style = MaterialTheme.typography.bodyLarge)
            }
            report.avgPurchase?.let {
                Text("Avg purchase: $${String.format("%.2f", it)}", style = MaterialTheme.typography.bodyMedium)
            }
            report.medianPayment?.let {
                Text("Median payment: $${String.format("%.2f", it)}", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
private fun AdminInvoiceCard(
    invoice: InvoiceListItemDto,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Order #${invoice.id}", style = MaterialTheme.typography.titleSmall)
                Text(
                    "$${String.format("%.2f", invoice.totalAmount)}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium
                )
            }
            Text(invoice.status, style = MaterialTheme.typography.labelSmall)
            invoice.email?.let { Text(it, style = MaterialTheme.typography.labelSmall) }
            invoice.createdAt?.let { Text(it.take(10), style = MaterialTheme.typography.labelSmall) }
        }
    }
}
