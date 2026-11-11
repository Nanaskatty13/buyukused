package com.buyukused.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        optimizeWebView();
    }

    private void optimizeWebView() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();

            // Force hardware acceleration on the WebView layer
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

            // Enable storage & caching for instant page loads
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            // Rasterize offscreen content before scrolling for smooth 60fps scrolling
            settings.setOffscreenPreRaster(true);
        }
    }
}
