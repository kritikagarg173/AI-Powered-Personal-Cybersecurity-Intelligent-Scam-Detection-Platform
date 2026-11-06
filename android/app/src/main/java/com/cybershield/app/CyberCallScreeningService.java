package com.cybershield.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.telecom.Call;
import android.telecom.CallScreeningService;

import androidx.core.app.NotificationCompat;

public class CyberCallScreeningService extends CallScreeningService {

    public static final String CHANNEL_ID =
            "cyber_shield_call_monitoring";

    public static final int NOTIFICATION_ID = 101;

    @Override
    public void onScreenCall(Call.Details callDetails) {

        CallResponse response =
                new CallResponse.Builder()
                        .setDisallowCall(false)
                        .setRejectCall(false)
                        .setSilenceCall(false)
                        .setSkipCallLog(false)
                        .setSkipNotification(false)
                        .build();

        respondToCall(callDetails, response);

        showMonitoringNotification();
    }

    private void showMonitoringNotification() {

        createNotificationChannel();

        Intent yesIntent =
                new Intent(this, MainActivity.class);

        yesIntent.putExtra(
                "open_live_monitoring",
                true
        );

        yesIntent.putExtra(
                "auto_start_monitoring",
                true
        );

        yesIntent.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        PendingIntent yesPendingIntent =
                PendingIntent.getActivity(
                        this,
                        201,
                        yesIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT |
                                PendingIntent.FLAG_IMMUTABLE
                );

        Intent noIntent =
                new Intent(
                        this,
                        CallMonitoringActionReceiver.class
                );

        noIntent.setAction(
                "CYBER_SHIELD_MONITORING_NO"
        );

        PendingIntent noPendingIntent =
                PendingIntent.getBroadcast(
                        this,
                        202,
                        noIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT |
                                PendingIntent.FLAG_IMMUTABLE
                );

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(
                        this,
                        CHANNEL_ID
                )
                        .setSmallIcon(
                                android.R.drawable.ic_dialog_alert
                        )
                        .setContentTitle(
                                "Cyber Shield AI"
                        )
                        .setContentText(
                                "Incoming call detected. Enable Live Call Monitoring?"
                        )
                        .setStyle(
                                new NotificationCompat.BigTextStyle()
                                        .bigText(
                                                "Incoming call detected. Enable Live Call Monitoring for this call?"
                                        )
                        )
                        .setPriority(
                                NotificationCompat.PRIORITY_MAX
                        )
                        .setCategory(
                                NotificationCompat.CATEGORY_CALL
                        )
                        .setVisibility(
                                NotificationCompat.VISIBILITY_PUBLIC
                        )
                        .setAutoCancel(true)
                        .addAction(
                                android.R.drawable.ic_menu_close_clear_cancel,
                                "NO",
                                noPendingIntent
                        )
                        .addAction(
                                android.R.drawable.ic_media_play,
                                "YES",
                                yesPendingIntent
                        )
                        .setContentIntent(
                                yesPendingIntent
                        );

        NotificationManager manager =
                (NotificationManager)
                        getSystemService(
                                NOTIFICATION_SERVICE
                        );

        manager.notify(
                NOTIFICATION_ID,
                builder.build()
        );
    }

    private void createNotificationChannel() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationChannel channel =
                    new NotificationChannel(
                            CHANNEL_ID,
                            "Cyber Shield Call Protection",
                            NotificationManager.IMPORTANCE_HIGH
                    );

            channel.setDescription(
                    "Ask whether Cyber Shield should enable AI monitoring during incoming calls."
            );

            channel.enableVibration(true);

            NotificationManager manager =
                    getSystemService(
                            NotificationManager.class
                    );

            manager.createNotificationChannel(
                    channel
            );
        }
    }
}