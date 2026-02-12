package com.ooplab.oopshop_app.ui.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.PrimaryButton
import com.ooplab.oopshop_app.ui.components.UserAvatar
import com.ooplab.oopshop_app.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    onLoginClick: () -> Unit,
    onCurrentOrdersClick: () -> Unit = {},
    onOrderHistoryClick: () -> Unit = {},
    onProfileSettingsClick: () -> Unit = {},
    onAdminPanelClick: () -> Unit = {},
    @SuppressLint("ModifierParameter") modifier: Modifier = Modifier
) {
    val currentUser by authViewModel.currentUser.observeAsState(initial = null)
    val isLoggedIn = authViewModel.isLoggedIn()
    // Do not call loadCurrentUser() here - MainScreen loads once; avoids 429 rate limit

    when {
        !isLoggedIn -> {
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    "You are not logged in",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(16.dp))
                PrimaryButton(text = "Log in", onClick = onLoginClick)
            }
        }
        currentUser is Resource.Loading -> LoadingView(modifier)
        currentUser is Resource.Success -> {
            val user = (currentUser as Resource.Success<UserDto>).data
            val isManager = user.role?.lowercase() == "manager"
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(modifier = Modifier.height(8.dp))
                    UserAvatar(
                        displayName = userDisplayName(user),
                        imageUrl = null,
                        size = 80.dp,
                        fontSize = MaterialTheme.typography.headlineSmall.fontSize
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = userDisplayName(user),
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = user.email,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(20.dp))
                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                Spacer(modifier = Modifier.height(8.dp))

                ProfileSectionButton(
                    title = "Current orders",
                    icon = Icons.Default.ReceiptLong,
                    onClick = onCurrentOrdersClick
                )
                ProfileSectionButton(
                    title = "Order history",
                    icon = Icons.Default.History,
                    onClick = onOrderHistoryClick
                )
                ProfileSectionButton(
                    title = "Profile settings",
                    icon = Icons.Default.Settings,
                    onClick = onProfileSettingsClick
                )
                if (isManager) {
                    ProfileSectionButton(
                        title = "Admin panel",
                        icon = Icons.Default.AdminPanelSettings,
                        onClick = onAdminPanelClick
                    )
                }

                Spacer(modifier = Modifier.weight(1f))
                PrimaryButton(
                    text = "Log out",
                    onClick = { authViewModel.logout() },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
        currentUser == null && isLoggedIn -> LoadingView(modifier)
        currentUser is Resource.Error -> {
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    (currentUser as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
                Text(
                    "You're still logged in.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(16.dp))
                PrimaryButton(text = "Retry", onClick = { authViewModel.loadCurrentUser() })
            }
        }
    }
}

@Composable
private fun ProfileSectionButton(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable(onClick = onClick),
        shape = CardDefaults.shape,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private fun userDisplayName(user: UserDto): String {
    val first = user.firstName?.trim() ?: ""
    val last = user.lastName?.trim() ?: ""
    return if (first.isNotEmpty() || last.isNotEmpty()) "$first $last".trim()
    else user.email
}
