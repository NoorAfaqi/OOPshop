// Apply only kotlin.compose; it includes Kotlin Android in 2.0 and avoids duplicate "kotlin" extension.
import org.gradle.testing.jacoco.tasks.JacocoReport

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    jacoco
}

android {
    namespace = "com.ooplab.oopshop_app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.ooplab.oopshop_app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        // Production: "https://oopshop.onrender.com/"
        buildConfigField("String", "API_BASE_URL", "\"https://oopshop.onrender.com/\"")
    }

    buildTypes {
        debug {
            // Enables JaCoCo unit-test coverage tasks (jacocoTestReport) used by CI.
            enableUnitTestCoverage = true
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

// Gradle 9+: jacocoTestReport reads outputs under app/build/ that overlap with lint/proguard tasks.
// Declare ordering so validation does not fail (implicit dependency between tasks).
afterEvaluate {
    tasks.named<JacocoReport>("jacocoTestReport").configure {
        dependsOn(
            "generateDebugLintReportModel",
            "generateDebugAndroidTestLintModel",
            "lintAnalyzeDebugAndroidTest",
            "lintAnalyzeDebug",
            "extractProguardFiles",
        )
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.compose.runtime.livedata)
    implementation(libs.androidx.navigation.compose)

    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.gson)
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.coil.compose)
    implementation(libs.barcode.scanning)
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)

    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    implementation(libs.androidx.material3)
    ksp(libs.androidx.room.compiler)

    testImplementation(libs.junit)
    testImplementation(libs.androidx.test.core)
    testImplementation(libs.robolectric)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

jacoco {
    toolVersion = libs.versions.jacoco.get()
}

tasks.withType<org.gradle.api.tasks.testing.Test>().configureEach {
    // Single fork avoids Gradle 9 + JDK 21 worker deserialization issues with JaCoCo-instrumented tests.
    maxParallelForks = 1
    configure<org.gradle.testing.jacoco.plugins.JacocoTaskExtension> {
        isIncludeNoLocationClasses = false
    }
}

private val jacocoClassExcludes = listOf(
    "**/R.class",
    "**/R\$*.class",
    "**/BuildConfig.*",
    "**/Manifest*.*",
    "**/*\$*\$*.class",
    "**/*\$inlined\$*.class",
    "**/*\$Lambda\$*.class",
    "**/*\$default.*",
    // Layers typically covered by instrumented/integration tests or manual QA; JVM report focuses on models & pure logic.
    "**/com/ooplab/oopshop_app/ui/screens/**",
    "**/com/ooplab/oopshop_app/ui/theme/**",
    "**/com/ooplab/oopshop_app/ui/components/**",
    "**/com/ooplab/oopshop_app/viewmodel/**",
    "**/com/ooplab/oopshop_app/data/repository/**",
    "**/com/ooplab/oopshop_app/data/network/**",
    "**/com/ooplab/oopshop_app/data/local/**",
    "**/com/ooplab/oopshop_app/MainActivity*.class"
)

tasks.register<org.gradle.testing.jacoco.tasks.JacocoReport>("jacocoTestReport") {
    dependsOn("testDebugUnitTest")
    group = "verification"
    description = "HTML/XML JaCoCo report for debug unit tests (open app/build/reports/jacoco/jacocoTestReport/html/index.html)"

    reports {
        xml.required.set(true)
        html.required.set(true)
    }

    val kotlinClasses = layout.buildDirectory.dir("tmp/kotlin-classes/debug").get().asFile
    classDirectories.setFrom(
        fileTree(kotlinClasses) {
            exclude(jacocoClassExcludes)
        }
    )
    sourceDirectories.setFrom(files("$projectDir/src/main/java"))
    executionData.setFrom(
        fileTree(layout.buildDirectory.get().asFile) {
            include("**/testDebugUnitTest.exec", "**/jacoco/testDebugUnitTest.exec")
        }
    )
}
