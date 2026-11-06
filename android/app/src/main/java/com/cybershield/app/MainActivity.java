package com.cybershield.app;

import android.app.role.RoleManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int CALL_SCREENING_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestCallScreeningRole();
        handleLiveMonitoringIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        setIntent(intent);
        handleLiveMonitoringIntent(intent);
    }

    private void handleLiveMonitoringIntent(Intent intent) {

        if (intent == null) {
            return;
        }

        boolean openLiveMonitoring =
                intent.getBooleanExtra(
                        "open_live_monitoring",
                        false
                );

        boolean autoStartMonitoring =
                intent.getBooleanExtra(
                        "auto_start_monitoring",
                        false
                );

        if (!openLiveMonitoring) {
            return;
        }

        getBridge()
                .getWebView()
                .postDelayed(
                        () -> {

                            String javascript =
                                    "localStorage.setItem('cyber_auto_start_monitoring','"
                                            + autoStartMonitoring
                                            + "');"
                                            + "window.history.pushState({},'',"
                                            + "'/live-call-monitoring');"
                                            + "window.dispatchEvent(new PopStateEvent('popstate'));";

                            getBridge()
                                    .getWebView()
                                    .evaluateJavascript(
                                            javascript,
                                            null
                                    );

                        },
                        500
                );
    }

    private void requestCallScreeningRole() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

            RoleManager roleManager =
                    (RoleManager)
                            getSystemService(
                                    ROLE_SERVICE
                            );

            if (
                    roleManager != null &&
                    roleManager.isRoleAvailable(
                            RoleManager.ROLE_CALL_SCREENING
                    ) &&
                    !roleManager.isRoleHeld(
                            RoleManager.ROLE_CALL_SCREENING
                    )
            ) {

                Intent roleIntent =
                        roleManager.createRequestRoleIntent(
                                RoleManager.ROLE_CALL_SCREENING
                        );

                startActivityForResult(
                        roleIntent,
                        CALL_SCREENING_REQUEST_CODE
                );
            }
        }
    }
}