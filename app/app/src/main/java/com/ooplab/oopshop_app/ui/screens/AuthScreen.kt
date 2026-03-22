package com.ooplab.oopshop_app.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ooplab.oopshop_app.data.repository.AuthResult
import com.ooplab.oopshop_app.data.repository.Resource
import com.ooplab.oopshop_app.ui.components.LoadingView
import com.ooplab.oopshop_app.ui.components.PrimaryButton
import com.ooplab.oopshop_app.viewmodel.AuthViewModel

private val fieldShape = RoundedCornerShape(16.dp)
private val cardOuterShape = RoundedCornerShape(28.dp)
private val cardInnerShape = RoundedCornerShape(26.dp)

private enum class AuthMode {
    Login,
    Register
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    onAuthSuccess: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var mode by remember { mutableStateOf(AuthMode.Login) }

    var loginEmail by remember { mutableStateOf("") }
    var loginPassword by remember { mutableStateOf("") }

    var regEmail by remember { mutableStateOf("") }
    var regPassword by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }

    val loginResult by viewModel.loginResult.observeAsState(initial = null)
    val registerResult by viewModel.registerResult.observeAsState(initial = null)

    LaunchedEffect(loginResult) {
        if (loginResult is Resource.Success) onAuthSuccess()
    }
    LaunchedEffect(registerResult) {
        if (registerResult is Resource.Success) onAuthSuccess()
    }

    val isLoading = loginResult is Resource.Loading || registerResult is Resource.Loading

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.surface,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Account",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.surface),
                contentAlignment = Alignment.Center
            ) {
                LoadingView(Modifier)
            }
        } else {
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Store,
                    contentDescription = null,
                    modifier = Modifier.padding(top = 8.dp, bottom = 12.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "OOPshop",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Sign in or create an account to continue",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 8.dp, bottom = 24.dp)
                )

                ModernAuthFormCard(
                    mode = mode,
                    onModeChange = { mode = it },
                    loginResult = loginResult,
                    registerResult = registerResult,
                    loginEmail = loginEmail,
                    onLoginEmailChange = { loginEmail = it },
                    loginPassword = loginPassword,
                    onLoginPasswordChange = { loginPassword = it },
                    regEmail = regEmail,
                    onRegEmailChange = { regEmail = it },
                    regPassword = regPassword,
                    onRegPasswordChange = { regPassword = it },
                    firstName = firstName,
                    onFirstNameChange = { firstName = it },
                    lastName = lastName,
                    onLastNameChange = { lastName = it },
                    onLogin = { viewModel.login(loginEmail, loginPassword) },
                    onRegister = {
                        viewModel.register(regEmail, regPassword, firstName, lastName)
                    }
                )
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun ModernAuthFormCard(
    mode: AuthMode,
    onModeChange: (AuthMode) -> Unit,
    loginResult: Resource<AuthResult>?,
    registerResult: Resource<AuthResult>?,
    loginEmail: String,
    onLoginEmailChange: (String) -> Unit,
    loginPassword: String,
    onLoginPasswordChange: (String) -> Unit,
    regEmail: String,
    onRegEmailChange: (String) -> Unit,
    regPassword: String,
    onRegPasswordChange: (String) -> Unit,
    firstName: String,
    onFirstNameChange: (String) -> Unit,
    lastName: String,
    onLastNameChange: (String) -> Unit,
    onLogin: () -> Unit,
    onRegister: () -> Unit
) {
    val scheme = MaterialTheme.colorScheme
    val borderGradient = Brush.linearGradient(
        colors = listOf(
            scheme.primary.copy(alpha = 0.65f),
            scheme.tertiary.copy(alpha = 0.5f),
            scheme.primary.copy(alpha = 0.35f)
        )
    )
    val topAccent = Brush.horizontalGradient(
        colors = listOf(
            scheme.primary,
            scheme.tertiary.copy(alpha = 0.85f),
            scheme.primary.copy(alpha = 0.7f)
        )
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 12.dp,
                shape = cardOuterShape,
                ambientColor = scheme.primary.copy(alpha = 0.18f),
                spotColor = scheme.primary.copy(alpha = 0.22f)
            )
            .clip(cardOuterShape)
            .background(borderGradient)
            .padding(1.5.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = cardInnerShape,
            colors = CardDefaults.cardColors(
                containerColor = scheme.surface
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(5.dp)
                        .background(topAccent)
                )
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 22.dp, vertical = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(18.dp)
                ) {
                    Text(
                        text = "Get started",
                        style = MaterialTheme.typography.labelLarge.copy(
                            letterSpacing = 0.6.sp
                        ),
                        fontWeight = FontWeight.SemiBold,
                        color = scheme.primary
                    )
                    Text(
                        text = if (mode == AuthMode.Login) {
                            "Welcome back — sign in with your email"
                        } else {
                            "Create your profile to shop and track orders"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = scheme.onSurfaceVariant
                    )
                    AuthModeToggle(
                        mode = mode,
                        onModeChange = onModeChange,
                        modifier = Modifier.fillMaxWidth()
                    )
                    AnimatedContent(
                        targetState = mode,
                        transitionSpec = {
                            fadeIn(animationSpec = tween(240)) togetherWith
                                fadeOut(animationSpec = tween(240))
                        },
                        label = "authForm"
                    ) { targetMode ->
                        when (targetMode) {
                            AuthMode.Login -> {
                                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                    if (loginResult is Resource.Error) {
                                        ErrorBanner((loginResult as Resource.Error).message)
                                    }
                                    OutlinedTextField(
                                        value = loginEmail,
                                        onValueChange = onLoginEmailChange,
                                        label = { Text("Email") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = fieldShape,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                                    )
                                    OutlinedTextField(
                                        value = loginPassword,
                                        onValueChange = onLoginPasswordChange,
                                        label = { Text("Password") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = fieldShape,
                                        visualTransformation = PasswordVisualTransformation(),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    PrimaryButton(
                                        text = "Sign in",
                                        onClick = onLogin,
                                        enabled = loginEmail.isNotBlank() && loginPassword.isNotBlank()
                                    )
                                }
                            }
                            AuthMode.Register -> {
                                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                    if (registerResult is Resource.Error) {
                                        ErrorBanner((registerResult as Resource.Error).message)
                                    }
                                    OutlinedTextField(
                                        value = regEmail,
                                        onValueChange = onRegEmailChange,
                                        label = { Text("Email") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = fieldShape,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                                    )
                                    OutlinedTextField(
                                        value = regPassword,
                                        onValueChange = onRegPasswordChange,
                                        label = { Text("Password") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = fieldShape,
                                        visualTransformation = PasswordVisualTransformation(),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                                    )
                                    OutlinedTextField(
                                        value = firstName,
                                        onValueChange = onFirstNameChange,
                                        label = { Text("First name") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = fieldShape
                                    )
                                    OutlinedTextField(
                                        value = lastName,
                                        onValueChange = onLastNameChange,
                                        label = { Text("Last name") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true,
                                        shape = fieldShape
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    PrimaryButton(
                                        text = "Create account",
                                        onClick = onRegister,
                                        enabled = regEmail.isNotBlank() &&
                                            regPassword.isNotBlank() &&
                                            firstName.isNotBlank() &&
                                            lastName.isNotBlank()
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AuthModeToggle(
    mode: AuthMode,
    onModeChange: (AuthMode) -> Unit,
    modifier: Modifier = Modifier
) {
    val scheme = MaterialTheme.colorScheme
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .border(
                width = 1.dp,
                color = scheme.outlineVariant.copy(alpha = 0.35f),
                shape = RoundedCornerShape(20.dp)
            )
            .background(scheme.surfaceContainerHigh.copy(alpha = 0.65f))
            .padding(5.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        val loginSelected = mode == AuthMode.Login
        val registerSelected = mode == AuthMode.Register
        Box(
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(14.dp))
                .then(
                    if (loginSelected) {
                        Modifier
                            .shadow(4.dp, RoundedCornerShape(14.dp), spotColor = scheme.primary.copy(alpha = 0.35f))
                            .background(scheme.primaryContainer)
                    } else {
                        Modifier.background(Color.Transparent)
                    }
                )
                .clickable { onModeChange(AuthMode.Login) }
                .padding(vertical = 12.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Sign in",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = if (loginSelected) FontWeight.SemiBold else FontWeight.Medium,
                color = if (loginSelected) scheme.onPrimaryContainer
                else scheme.onSurfaceVariant
            )
        }
        Box(
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(14.dp))
                .then(
                    if (registerSelected) {
                        Modifier
                            .shadow(4.dp, RoundedCornerShape(14.dp), spotColor = scheme.primary.copy(alpha = 0.35f))
                            .background(scheme.primaryContainer)
                    } else {
                        Modifier.background(Color.Transparent)
                    }
                )
                .clickable { onModeChange(AuthMode.Register) }
                .padding(vertical = 12.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Create account",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = if (registerSelected) FontWeight.SemiBold else FontWeight.Medium,
                color = if (registerSelected) scheme.onPrimaryContainer
                else scheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ErrorBanner(message: String) {
    Text(
        text = message,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onErrorContainer,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f))
            .padding(12.dp)
    )
}
