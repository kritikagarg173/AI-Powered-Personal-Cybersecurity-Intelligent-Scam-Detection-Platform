package com.cybershield.app;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class CallMonitoringActionReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        if (
                intent != null &&
                "CYBER_SHIELD_MONITORING_NO".equals(
                        intent.getAction()
                )
        ) {

            NotificationManager manager =
                    (NotificationManager)
                            context.getSystemService(
                                    Context.NOTIFICATION_SERVICE
                            );

            manager.cancel(
                    CyberCallScreeningService.NOTIFICATION_ID
            );
        }
    }
}