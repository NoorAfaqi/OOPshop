package com.ooplab.oopshop_app.ui.components

import com.ooplab.oopshop_app.data.dto.SalesTrendItemDto
import java.time.LocalDate

/**
 * One row per calendar day for the last 30 days ending today (inclusive).
 * Days with no sales use total 0.0 so the line chart shows the full window.
 */
fun denseSalesTrendLast30Days(items: List<SalesTrendItemDto>): List<SalesTrendItemDto> {
    val end = LocalDate.now()
    val start = end.minusDays(29)
    val totalsByDay = mutableMapOf<LocalDate, Double>()
    for (dto in items) {
        val raw = dto.date?.take(10) ?: continue
        val day = runCatching { LocalDate.parse(raw) }.getOrNull() ?: continue
        if (day.isBefore(start) || day.isAfter(end)) continue
        val v = dto.total ?: continue
        totalsByDay[day] = totalsByDay.getOrDefault(day, 0.0) + v
    }
    val out = ArrayList<SalesTrendItemDto>(30)
    var d = start
    while (!d.isAfter(end)) {
        out.add(
            SalesTrendItemDto(
                date = d.toString(),
                total = totalsByDay[d] ?: 0.0
            )
        )
        d = d.plusDays(1)
    }
    return out
}
