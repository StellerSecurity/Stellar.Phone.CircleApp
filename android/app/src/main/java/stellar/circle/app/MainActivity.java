package stellar.circle.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StellarSecurityPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
