package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.MostPurchasedProductDto
import com.ooplab.oopshop_app.data.dto.ReportDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.SalesTrendLineChart
import com.ooplab.oopshop_app.ui.components.denseSalesTrendLast30Days
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

private val cardShape = RoundedCornerShape(16.dp)

@Composable
fun AdminReportsScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val reportResource by adminViewModel.report.observeAsState(initial = Resource.Loading)

    LaunchedEffect(Unit) {
        adminViewModel.loadReport()
    }

    when (reportResource) {
        is Resource.Loading -> Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface),
            contentAlignment = Alignment.Center
        ) {
            LoadingView(Modifier)
        }
        is Resource.Success -> {
            val report = (reportResource as Resource.Success<ReportDto>).data
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Text(
                    text = "Reports",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Sales performance and top sellers · last 30 days",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                ReportsSectionTitle("Sales summary")
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
                    SalesMetricsCard(report = report)
                }

                report.mostPurchasedProducts?.takeIf { it.isNotEmpty() }?.let { products ->
                    ReportsSectionTitle("Top products")
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        products.forEachIndexed { index, p ->
                            TopProductRow(rank = index + 1, product = p)
                        }
                    }
                }

                ReportsSectionTitle("Sales trend")
                val trend30 = denseSalesTrendLast30Days(report.salesTrend.orEmpty())
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = cardShape,
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceContainerLow
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Last 30 days · one point per day",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        SalesTrendLineChart(
                            items = trend30,
                            modifier = Modifier.padding(top = 12.dp)
                        )
                    }
                }
            }
        }
        is Resource.Error -> Column(
            modifier = modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            ReportsErrorBanner((reportResource as Resource.Error).message)
        }
    }
}

@Composable
private fun ReportsSectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurface
    )
}

@Composable
private fun ReportsErrorBanner(message: String) {
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
                imageVector = Icons.Default.Insights,
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
private fun SalesMetricsCard(report: ReportDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
private fun TopProductRow(rank: Int, product: MostPurchasedProductDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Text(
                    text = "#$rank",
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name ?: "Product #${product.id}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            product.totalQuantity?.let { qty ->
                Text(
                    text = "$qty sold",
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

