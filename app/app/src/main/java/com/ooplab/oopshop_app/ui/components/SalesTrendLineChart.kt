package com.ooplab.oopshop_app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.SalesTrendItemDto
import kotlin.math.max

/**
 * Simple line chart for sales trend (date → total). Uses theme primary for the line.
 */
@Composable
fun SalesTrendLineChart(
    items: List<SalesTrendItemDto>,
    modifier: Modifier = Modifier
) {
    val lineColor = MaterialTheme.colorScheme.primary
    val gridColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.45f)
    val fillColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
    val pointOutline = MaterialTheme.colorScheme.surface

    val points = remember(items) {
        items.mapNotNull { dto ->
            val t = dto.total ?: return@mapNotNull null
            TrendPoint(
                label = dto.date?.take(10) ?: "—",
                value = t
            )
        }
    }

    if (points.isEmpty()) {
        Text(
            text = "No trend data to plot",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = modifier.padding(vertical = 24.dp)
        )
        return
    }

    val minY = points.minOf { it.value }
    val maxY = points.maxOf { it.value }
    val span = (maxY - minY).let { if (it < 1e-9) 1.0 else it }
    val paddedMin = minY - span * 0.08
    val paddedMax = maxY + span * 0.08
    val yRange = (paddedMax - paddedMin).let { if (it < 1e-9) 1.0 else it }

    fun yToPx(value: Double, heightPx: Float): Float {
        val t = ((value - paddedMin) / yRange).toFloat().coerceIn(0f, 1f)
        return heightPx * (1f - t)
    }

    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier
                    .width(44.dp)
                    .height(200.dp)
                    .padding(end = 4.dp),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = formatMoneyCompact(paddedMax),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = formatMoneyCompact(paddedMin),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Canvas(
                modifier = Modifier
                    .weight(1f)
                    .height(200.dp)
            ) {
                val w = size.width
                val h = size.height
                val n = points.size
                val xPositions = FloatArray(n) { i ->
                    if (n == 1) w / 2f
                    else (w * i / (n - 1f))
                }
                val yPositions = FloatArray(n) { i ->
                    yToPx(points[i].value, h)
                }

                // Horizontal grid
                val gridLines = 4
                for (g in 1 until gridLines) {
                    val gy = h * g / gridLines.toFloat()
                    drawLine(
                        color = gridColor,
                        start = Offset(0f, gy),
                        end = Offset(w, gy),
                        strokeWidth = 1.dp.toPx()
                    )
                }

                if (n >= 2) {
                    val linePath = Path().apply {
                        moveTo(xPositions[0], yPositions[0])
                        for (i in 1 until n) {
                            lineTo(xPositions[i], yPositions[i])
                        }
                    }

                    val fillPath = Path().apply {
                        moveTo(xPositions[0], h)
                        lineTo(xPositions[0], yPositions[0])
                        for (i in 1 until n) {
                            lineTo(xPositions[i], yPositions[i])
                        }
                        lineTo(xPositions[n - 1], h)
                        close()
                    }

                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(fillColor, Color.Transparent),
                            startY = 0f,
                            endY = h
                        )
                    )

                    drawPath(
                        path = linePath,
                        color = lineColor,
                        style = Stroke(
                            width = 3.dp.toPx(),
                            cap = StrokeCap.Round
                        )
                    )
                }

                val pointRadius = 4.dp.toPx()
                for (i in 0 until n) {
                    drawCircle(
                        color = pointOutline,
                        radius = pointRadius + 1.5.dp.toPx(),
                        center = Offset(xPositions[i], yPositions[i])
                    )
                    drawCircle(
                        color = lineColor,
                        radius = pointRadius,
                        center = Offset(xPositions[i], yPositions[i])
                    )
                }
            }
        }

        when (points.size) {
            1 -> Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 48.dp, top = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = points.first().label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
            }
            else -> Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 48.dp, top = 8.dp, end = 0.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = points.first().label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (points.size >= 3) {
                    Text(
                        text = points[points.size / 2].label,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = points.last().label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

private data class TrendPoint(val label: String, val value: Double)

private fun formatMoneyCompact(value: Double): String {
    val v = max(0.0, value)
    return if (v >= 1000) "$${String.format("%,.0f", v)}"
    else "$${String.format("%.2f", v)}"
}
