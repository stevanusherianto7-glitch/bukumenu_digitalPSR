package com.pawonsalam.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        // Ambil path khusus dari flavor (/, /admin, atau /waiter)
        String path = getString(R.string.start_url);
        String liveUrl = "https://bukumenu-digital-psr.vercel.app" + path;
        
        // Gunakan loadUrl langsung pada WebView melalui bridge
        if (this.getBridge() != null && this.getBridge().getWebView() != null) {
            this.getBridge().getWebView().loadUrl(liveUrl);
        }
    }
}
