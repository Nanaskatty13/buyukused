# Project specific ProGuard rules

# Keep Capacitor Bridge & plugin classes
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keep interface com.getcapacitor.** { *; }

# Keep JavaScript Interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve WebView classes
-keep class android.webkit.** { *; }
