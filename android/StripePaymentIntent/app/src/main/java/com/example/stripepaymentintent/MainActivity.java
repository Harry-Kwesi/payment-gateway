package com.example.stripepaymentintent;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button button = findViewById(R.id.go_to_payment);

        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String paymentPageUrl = "https://d485-2401-4900-1cc8-d17d-259b-99c2-a803-14da.ngrok-free.app/checkout.html";//use the appropriate url with checkout.html as a route

                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(paymentPageUrl));
                startActivity(browserIntent);
            }
        });
    }

}