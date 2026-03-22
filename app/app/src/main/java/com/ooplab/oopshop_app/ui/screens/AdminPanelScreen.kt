package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Warning
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import com.ooplab.oopshop_app.data.dto.ReportDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.OrderStatusChip
import com.ooplab.oopshop_app.ui.components.formatOrderDate
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

private val cardShape = RoundedCornerShape(16.dp)
private val statCardWidth = 148.dp

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
            .padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text(
            text = "Overview",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = "Key metrics and recent activity",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        DashboardSectionTitle("Quick stats")
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            val userCount = (usersResource as? Resource.Success)?.data?.size
            val productCount = (productsResource as? Resource.Success)?.data?.size
            val lowStockCount = (lowStockResource as? Resource.Success)?.data?.size
            val usersLoading = usersResource is Resource.Loading
            val productsLoading = productsResource is Resource.Loading
            val lowStockLoading = lowStockResource is Resource.Loading
            QuickStatCard(
                title = "Users",
                count = userCount,
                isLoading = usersLoading,
                icon = Icons.Default.People,
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                onClick = onNavigateToUsers,
                modifier = Modifier.width(statCardWidth)
            )
            QuickStatCard(
                title = "Products",
                count = productCount,
                isLoading = productsLoading,
                icon = Icons.Default.ShoppingBag,
                containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
                onClick = onNavigateToProducts,
                modifier = Modifier.width(statCardWidth)
            )
            QuickStatCard(
                title = "Low stock",
                count = lowStockCount,
                isLoading = lowStockLoading,
                icon = Icons.Default.Warning,
                containerColor = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer,
                onClick = onNavigateToInventory,
                modifier = Modifier.width(statCardWidth)
            )
        }

        HorizontalDivider(
            modifier = Modifier.padding(vertical = 4.dp),
            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
        )

        DashboardSectionTitle("Sales report")
        when (reportResource) {
            is Resource.Loading -> Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(MaterialTheme.colorScheme.surfaceContainerHighest.copy(alpha = 0.6f))
                    .padding(28.dp),
                contentAlignment = Alignment.Center
            ) { LoadingView(Modifier) }
            is Resource.Success -> {
                val report = (reportResource as Resource.Success<ReportDto>).data
                if (report.totalSales == null && report.avgPurchase == null && report.medianPayment == null) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = cardShape,
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Text(
                            text = "No sales figures available for the selected period",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(20.dp)
                        )
                    }
                } else {
                    ReportSummaryCard(report = report)
                }
            }
            is Resource.Error -> ErrorBanner((reportResource as Resource.Error).message)
        }

        HorizontalDivider(
            modifier = Modifier.padding(vertical = 4.dp),
            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
        )

        DashboardSectionTitle("Recent orders")
        when (invoicesResource) {
            is Resource.Loading -> Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(MaterialTheme.colorScheme.surfaceContainerHighest.copy(alpha = 0.6f))
                    .padding(28.dp),
                contentAlignment = Alignment.Center
            ) { LoadingView(Modifier) }
            is Resource.Success -> {
                val list = (invoicesResource as Resource.Success<List<InvoiceListItemDto>>).data
                if (list.isEmpty()) {
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
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingBag,
                                contentDescription = null,
                                modifier = Modifier.size(40.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            )
                            Text(
                                text = "No orders yet",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "New orders will show up here",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        list.take(5).forEach { inv ->
                            AdminInvoiceCard(invoice = inv, onClick = { onInvoiceClick(inv.id) })
                        }
                        if (list.size > 5) {
                            Text(
                                text = "See all (${list.size}) →",
                                style = MaterialTheme.typography.labelLarge,
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
            is Resource.Error -> ErrorBanner((invoicesResource as Resource.Error).message)
        }
    }
}

@Composable
private fun DashboardSectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurface
    )
}

@Composable
private fun ErrorBanner(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.45f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onErrorContainer,
            modifier = Modifier.padding(16.dp)
        )
    }
}

@Composable
private fun QuickStatCard(
    title: String,
    count: Int?,
    isLoading: Boolean,
    icon: ImageVector,
    containerColor: Color,
    contentColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(26.dp),
                tint = contentColor.copy(alpha = 0.9f)
            )
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(28.dp),
                    color = contentColor,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = count?.toString() ?: "—",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = contentColor
                )
            }
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Medium,
                color = contentColor.copy(alpha = 0.85f)
            )
        }
    }
}

@Composable
private fun ReportSummaryCard(report: ReportDto, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Last 30 days",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            report.totalSales?.let {
                ReportMetricRow(label = "Total sales", value = "$${String.format("%.2f", it)}")
            }
            report.avgPurchase?.let {
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f))
                ReportMetricRow(label = "Avg purchase", value = "$${String.format("%.2f", it)}")
            }
            report.medianPayment?.let {
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f))
                ReportMetricRow(label = "Median payment", value = "$${String.format("%.2f", it)}")
            }
        }
    }
}

@Composable
private fun ReportMetricRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun AdminInvoiceCard(
    invoice: InvoiceListItemDto,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
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
                        text = "Order #${invoice.id}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    invoice.createdAt?.let { raw ->
                        Text(
                            text = formatOrderDate(raw),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "$${String.format("%.2f", invoice.totalAmount)}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OrderStatusChip(status = invoice.status)
                val name = listOfNotNull(invoice.firstName, invoice.lastName)
                    .joinToString(" ")
                    .takeIf { it.isNotBlank() }
                val subtitle = name ?: invoice.email
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.End,
                        modifier = Modifier.weight(1f)
                    )
                } else {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}
