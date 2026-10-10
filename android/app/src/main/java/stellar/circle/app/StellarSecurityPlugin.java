package stellar.circle.app;

import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Block document navigation through Capacitor's internal HTTP proxy. */
@CapacitorPlugin(name = "StellarSecurity")
public class StellarSecurityPlugin extends Plugin {
    @Override
    public Boolean shouldOverrideLoad(Uri url) {
        String path = url == null ? null : url.getPath();
        return path != null && path.startsWith("/_capacitor_http_interceptor_")
                ? Boolean.TRUE : null;
    }
}
