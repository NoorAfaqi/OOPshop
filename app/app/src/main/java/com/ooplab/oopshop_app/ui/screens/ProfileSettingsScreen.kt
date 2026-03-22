package com.ooplab.oopshop_app.ui.screens

import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.PrimaryButton
import com.ooplab.oopshop_app.viewmodel.AccountViewModel
import com.ooplab.oopshop_app.viewmodel.AuthViewModel

private val cardShape = RoundedCornerShape(16.dp)
private val fieldShape = RoundedCornerShape(16.dp)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileSettingsScreen(
    authViewModel: AuthViewModel,
    accountViewModel: AccountViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onChangePasswordClick: () -> Unit = {}
) {
    val currentUser by authViewModel.currentUser.observeAsState(initial = null)
    val updateResult by accountViewModel.updateProfileResult.observeAsState(initial = null)

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var billingStreet by remember { mutableStateOf("") }
    var billingZip by remember { mutableStateOf("") }
    var billingCity by remember { mutableStateOf("") }
    var billingCountry by remember { mutableStateOf("") }
    var personalExpanded by remember { mutableStateOf(false) }
    var billingExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(currentUser) {
        when (val u = currentUser) {
            is Resource.Success -> {
                val user = u.data
                firstName = user.firstName?.trim() ?: ""
                lastName = user.lastName?.trim() ?: ""
                phone = user.phone?.trim() ?: ""
                billingStreet = user.billingStreet?.trim() ?: ""
                billingZip = user.billingZip?.trim() ?: ""
                billingCity = user.billingCity?.trim() ?: ""
                billingCountry = user.billingCountry?.trim() ?: ""
            }
            else -> { }
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.surface,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Profile settings",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { padding ->
        when (currentUser) {
            is Resource.Loading -> Box(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.surface),
                contentAlignment = Alignment.Center
            ) {
                LoadingView(Modifier)
            }
            else -> {
                Column(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Your account",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Update your name, phone, and billing address",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    ExpandableSection(
                        title = "Personal information",
                        leadingIcon = Icons.Default.Person,
                        expanded = personalExpanded,
                        onToggle = { personalExpanded = !personalExpanded }
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = firstName,
                                onValueChange = { firstName = it },
                                label = { Text("First name") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                            OutlinedTextField(
                                value = lastName,
                                onValueChange = { lastName = it },
                                label = { Text("Last name") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                            OutlinedTextField(
                                value = phone,
                                onValueChange = { phone = it },
                                label = { Text("Phone") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                        }
                    }

                    ExpandableSection(
                        title = "Billing details",
                        leadingIcon = Icons.Default.LocationOn,
                        expanded = billingExpanded,
                        onToggle = { billingExpanded = !billingExpanded }
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            OutlinedTextField(
                                value = billingStreet,
                                onValueChange = { billingStreet = it },
                                label = { Text("Street") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                            OutlinedTextField(
                                value = billingZip,
                                onValueChange = { billingZip = it },
                                label = { Text("ZIP / Postal code") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                            OutlinedTextField(
                                value = billingCity,
                                onValueChange = { billingCity = it },
                                label = { Text("City") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                            OutlinedTextField(
                                value = billingCountry,
                                onValueChange = { billingCountry = it },
                                label = { Text("Country") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                shape = fieldShape
                            )
                        }
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onChangePasswordClick),
                        shape = cardShape,
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                Icon(
                                    Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = "Change password",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    when (updateResult) {
                        is Resource.Success -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = cardShape,
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                                ),
                                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                            ) {
                                Text(
                                    text = "Changes saved",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    modifier = Modifier.padding(14.dp)
                                )
                            }
                        }
                        is Resource.Error -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = cardShape,
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.45f)
                                ),
                                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                            ) {
                                Text(
                                    text = (updateResult as Resource.Error).message,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onErrorContainer,
                                    modifier = Modifier.padding(14.dp)
                                )
                            }
                        }
                        else -> { }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    PrimaryButton(
                        text = "Save changes",
                        onClick = {
                            accountViewModel.updateProfile(
                                firstName = firstName.takeIf { it.isNotBlank() },
                                lastName = lastName.takeIf { it.isNotBlank() },
                                phone = phone.takeIf { it.isNotBlank() },
                                billingStreet = billingStreet.takeIf { it.isNotBlank() },
                                billingZip = billingZip.takeIf { it.isNotBlank() },
                                billingCity = billingCity.takeIf { it.isNotBlank() },
                                billingCountry = billingCountry.takeIf { it.isNotBlank() }
                            )
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
private fun ExpandableSection(
    title: String,
    leadingIcon: ImageVector,
    expanded: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .animateContentSize(animationSpec = tween(200)),
        shape = cardShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle)
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = leadingIcon,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (expanded) {
                HorizontalDivider(
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    content()
                }
            }
        }
    }
}
