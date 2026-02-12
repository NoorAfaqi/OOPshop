package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.InvoiceListItemDto
import com.ooplab.oopshop_app.data.dto.ReportDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPanelScreen(
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val reportResource by adminViewModel.report.observeAsState(initial = Resource.Loading)
    val invoicesResource by adminViewModel.allInvoices.observeAsState(initial = Resource.Loading)

    LaunchedEffect(Unit) {
        adminViewModel.loadReport()
        adminViewModel.loadAllInvoices()
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text("Admin panel") },
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (reportResource) {
                is Resource.Loading -> LoadingView(Modifier.fillMaxWidth())
                is Resource.Success -> {
                    val report = (reportResource as Resource.Success<ReportDto>).data
                    ReportSummaryCard(report = report)
                }
                is Resource.Error -> {
                    Text(
                        (reportResource as Resource.Error).message,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }

            Text(
                "All orders",
                style = MaterialTheme.typography.titleMedium
            )
            when (invoicesResource) {
                is Resource.Loading -> LoadingView(Modifier.fillMaxWidth())
                is Resource.Success -> {
                    val list = (invoicesResource as Resource.Success<List<InvoiceListItemDto>>).data
                    if (list.isEmpty()) {
                        Text(
                            "No invoices",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        list.forEach { inv ->
                            AdminInvoiceCard(invoice = inv)
                        }
                    }
                }
                is Resource.Error -> {
                    Text(
                        (invoicesResource as Resource.Error).message,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
private fun ReportSummaryCard(
    report: ReportDto,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Sales report", style = MaterialTheme.typography.titleSmall)
            report.totalSales?.let {
                Text("Total sales: $${String.format("%.2f", it)}", style = MaterialTheme.typography.bodyMedium)
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
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text("Order #${invoice.id}", style = MaterialTheme.typography.titleSmall)
            Text("$${String.format("%.2f", invoice.totalAmount)}", style = MaterialTheme.typography.bodyMedium)
            Text(invoice.status, style = MaterialTheme.typography.labelSmall)
            invoice.email?.let { Text(it, style = MaterialTheme.typography.labelSmall) }
            invoice.createdAt?.let { Text(it.take(10), style = MaterialTheme.typography.labelSmall) }
        }
    }
}
