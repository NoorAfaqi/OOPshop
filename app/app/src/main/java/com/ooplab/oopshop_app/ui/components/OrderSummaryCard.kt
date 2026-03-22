package com.ooplab.oopshop_app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.OrderSummaryDto
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun OrderSummaryCard(
    order: OrderSummaryDto,
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
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Order #${order.id}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    order.createdAt?.let { raw ->
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
                        text = "$${String.format("%.2f", order.totalAmount)}",
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
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OrderStatusChip(status = order.status)
                order.itemCount?.takeIf { it > 0 }?.let { count ->
                    Text(
                        text = if (count == 1) "1 item" else "$count items",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            order.items?.takeIf { it.isNotBlank() }?.let { summary ->
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f))
                Text(
                    text = summary,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

/** Colored pill for order status; reused on list cards and order detail. */
@Composable
fun OrderStatusChip(status: String) {
    val label = status.replace('_', ' ')
        .split(' ')
        .filter { it.isNotBlank() }
        .joinToString(" ") { word ->
            word.lowercase(Locale.getDefault()).replaceFirstChar { it.uppercase() }
        }
    val (container, content) = statusChipColors(status)
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = container
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Medium,
            color = content
        )
    }
}

@Composable
private fun statusChipColors(status: String): Pair<Color, Color> {
    val scheme = MaterialTheme.colorScheme
    val s = status.lowercase(Locale.getDefault())
    return when {
        s.contains("cancel") || s.contains("refund") ->
            scheme.errorContainer to scheme.onErrorContainer
        s.contains("deliver") || s.contains("complet") || s.contains("paid") || s.contains("ship") ->
            scheme.tertiaryContainer to scheme.onTertiaryContainer
        s.contains("pending") || s.contains("process") || s.contains("open") ->
            scheme.secondaryContainer to scheme.onSecondaryContainer
        else ->
            scheme.primaryContainer to scheme.onPrimaryContainer
    }
}

fun formatOrderDate(raw: String): String {
    return try {
        val date = LocalDate.parse(raw.take(10))
        date.format(DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.getDefault()))
    } catch (_: Exception) {
        raw.take(10)
    }
}
