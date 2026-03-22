package com.ooplab.oopshop_app.data.dto

/**
 * Body for PUT /invoices/:id — backend expects { "status": "pending"|"paid"|"cancelled"|"shipped" }
 */
data class UpdateInvoiceStatusRequest(val status: String)
