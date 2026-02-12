package com.ooplab.oopshop_app.ui.components

import android.content.Context
import android.widget.Toast

/**
 * Shows a short toast. Use from composables via LocalContext.current.
 */
fun showToast(context: Context, message: String) {
    Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
}
