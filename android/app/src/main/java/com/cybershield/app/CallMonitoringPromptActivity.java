package com.cybershield.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class CallMonitoringPromptActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);

        Window window = getWindow();

        window.setBackgroundDrawableResource(
                android.R.color.transparent
        );

        window.setDimAmount(0.45f);
        window.addFlags(
                WindowManager.LayoutParams.FLAG_DIM_BEHIND |
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        WindowManager.LayoutParams params =
                window.getAttributes();

        params.width =
                WindowManager.LayoutParams.MATCH_PARENT;

        params.height =
                WindowManager.LayoutParams.WRAP_CONTENT;

        params.gravity = Gravity.BOTTOM;

        window.setAttributes(params);

        // Main bottom sheet
        LinearLayout container =
                new LinearLayout(this);

        container.setOrientation(
                LinearLayout.VERTICAL
        );

        container.setPadding(
                45,
                35,
                45,
                35
        );

        GradientDrawable background =
                new GradientDrawable();

        background.setColor(Color.WHITE);

        background.setCornerRadii(
                new float[]{
                        45, 45,
                        45, 45,
                        0, 0,
                        0, 0
                }
        );

        container.setBackground(background);

        TextView title =
                new TextView(this);

        title.setText(
                "Cyber Shield AI"
        );

        title.setTextSize(20);
        title.setTextColor(
                Color.rgb(15, 23, 42)
        );

        title.setGravity(Gravity.CENTER);

        title.setPadding(
                0,
                5,
                0,
                15
        );

        container.addView(title);

        TextView message =
                new TextView(this);

        message.setText(
                "Incoming call detected.\nEnable Live Call Monitoring?"
        );

        message.setTextSize(15);
        message.setTextColor(
                Color.rgb(71, 85, 105)
        );

        message.setGravity(Gravity.CENTER);

        message.setPadding(
                0,
                0,
                0,
                30
        );

        container.addView(message);

        LinearLayout buttons =
                new LinearLayout(this);

        buttons.setOrientation(
                LinearLayout.HORIZONTAL
        );

        buttons.setGravity(Gravity.CENTER);

        // NO button
        Button noButton =
                new Button(this);

        noButton.setText("NO");

        LinearLayout.LayoutParams noParams =
                new LinearLayout.LayoutParams(
                        0,
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        1
                );

        noParams.setMargins(
                0,
                0,
                12,
                0
        );

        noButton.setLayoutParams(noParams);

        noButton.setOnClickListener(
                view -> finish()
        );

        buttons.addView(noButton);

        // YES button
        Button yesButton =
                new Button(this);

        yesButton.setText("YES");

        LinearLayout.LayoutParams yesParams =
                new LinearLayout.LayoutParams(
                        0,
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        1
                );

        yesParams.setMargins(
                12,
                0,
                0,
                0
        );

        yesButton.setLayoutParams(yesParams);

        yesButton.setOnClickListener(
                view -> {

                    Intent intent =
                            new Intent(
                                    this,
                                    MainActivity.class
                            );

                    intent.putExtra(
                            "open_live_monitoring",
                            true
                    );

                    intent.putExtra(
                            "auto_start_monitoring",
                            true
                    );

                    intent.addFlags(
                            Intent.FLAG_ACTIVITY_NEW_TASK |
                            Intent.FLAG_ACTIVITY_CLEAR_TOP |
                            Intent.FLAG_ACTIVITY_SINGLE_TOP
                    );

                    startActivity(intent);

                    finish();
                }
        );

        buttons.addView(yesButton);

        container.addView(buttons);

        setContentView(container);
    }
}