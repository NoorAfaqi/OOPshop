package com.ooplab.oopshop_app.ui.components

import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import coil.compose.SubcomposeAsyncImageContent
import coil.request.ImageRequest
import com.ooplab.oopshop_app.data.dto.ProductDto
import com.ooplab.oopshop_app.ui.components.ProductImagePlaceholder

/**
 * Reusable product card for list/grid. Shows image, name, price; click navigates to detail.
 */
@SuppressLint("DefaultLocale")
@Composable
fun ProductCard(
    product: ProductDto,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(0.dp)) {
            val imageUrl = product.imageUrl
            val imageModifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
            if (!imageUrl.isNullOrBlank()) {
                SubcomposeAsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(imageUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = product.name,
                    modifier = imageModifier,
                    contentScale = ContentScale.Crop,
                    loading = {
                        ProductImagePlaceholder(modifier = imageModifier, iconSizeDp = 40, showLabel = true)
                    },
                    success = { SubcomposeAsyncImageContent() },
                    error = {
                        ProductImagePlaceholder(modifier = imageModifier, iconSizeDp = 40, showLabel = true)
                    }
                )
            } else {
                ProductImagePlaceholder(
                    modifier = imageModifier,
                    iconSizeDp = 40,
                    showLabel = true
                )
            }
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Column(modifier = Modifier.height(20.dp).fillMaxWidth()) {
                    product.description?.takeIf { it.isNotBlank() }?.let { desc ->
                        val snippet = if (desc.length > 80) desc.take(80) + "..." else desc
                        Text(
                            text = snippet,
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$${String.format("%.2f", product.price)}",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ProductCardPreview() {
    ProductCard(onClick = {}, product = ProductDto(
        id = 1,
        name = "Camera",
        price = 10.9,
        imageUrl = "https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg"))
}
