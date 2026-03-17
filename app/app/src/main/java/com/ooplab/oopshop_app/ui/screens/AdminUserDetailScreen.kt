package com.ooplab.oopshop_app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.dto.UserDto
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.viewmodel.AdminViewModel

@Composable
fun AdminUserDetailScreen(
    userId: Int,
    adminViewModel: AdminViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val userResource by adminViewModel.userDetail.observeAsState(initial = Resource.Loading)

    LaunchedEffect(userId) {
        adminViewModel.loadUserById(userId)
    }

    when (userResource) {
        is Resource.Loading -> LoadingView(Modifier.fillMaxSize())
        is Resource.Success -> {
            val user = (userResource as Resource.Success<UserDto>).data
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                "${user.firstName ?: ""} ${user.lastName ?: ""}".trim().ifEmpty { "User #${user.id}" },
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(user.email, style = MaterialTheme.typography.bodyMedium)
                            user.phone?.let { Text("Phone: $it", style = MaterialTheme.typography.bodySmall) }
                            user.role?.let { Text("Role: $it", style = MaterialTheme.typography.bodySmall) }
                            user.createdAt?.let { Text("Joined: $it", style = MaterialTheme.typography.bodySmall) }
                        }
                    }
                }
        }
        is Resource.Error -> {
            Column(Modifier.padding(16.dp)) {
                Text(
                    (userResource as Resource.Error).message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
