package com.example.morgue_module;
import androidx.appcompat.app.AppCompatDelegate;

import android.app.Application;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.widget.ImageView;
import android.widget.Toast;
import android.Manifest;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.util.Map;
import java.util.ResourceBundle;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class SignIn extends AppCompatActivity {
    MaterialButton btnSignIn;
    ImageView ivGorkan_Clip;
    TextInputEditText etUsernameSignin,etPasswordSignin;

    static public String baseURL;
    static public String websocketURL;
    static public String AIURL;
    static public Morgue morgue;

    static public int Total=0;
    static public int Booked=0;


    ProgressDialog progressDialog;

    Context context;


    SharedPrefsManager manager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.splash);
        context= SignIn.this;
        manager = new SharedPrefsManager(context);
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        getWindow().setStatusBarColor(ContextCompat.getColor(this, R.color.BG));
        progressDialog = new ProgressDialog( context );
        progressDialog.setMessage( "Loading..." );
        progressDialog.setCancelable(false);  // Prevent canceling by tapping outside
        progressDialog.setIndeterminate(true);  // Show indeterminate spinner
        registerIP();


        new Handler().postDelayed( ()->{
            setContentView(R.layout.activity_sign_in);

            if(manager.getKeyCustomID()!=null)
            {
                morgue = manager.getMorgue();
                MainActivity.morgue = manager.getMorgue();
                Total = morgue.getTotalCabins();
                Booked = morgue.getBookedCabins();
                SignInrequest( morgue.getCustomID(),manager.getPassword()) ;
                //Intent intent = new Intent(SignIn.this,MainActivity.class);
                //startActivity(intent);
                //finish();
            }
            btnSignIn = findViewById(R.id.btnSignIn);
            ivGorkan_Clip = findViewById(R.id.ivGorkan_Clip);
            etPasswordSignin = findViewById(R.id.etPasswordSignin);
            etUsernameSignin = findViewById(R.id.etUsernameSignin);
            btnSignIn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    //Intent intent = new Intent(SignIn.this,MainActivity.class);
                    //startActivity(intent);
                    //finish();
                    //Intent intent = new Intent(SignIn.this,MainActivity.class);
                    //startActivity(intent);
                    //finish();
                    if(etUsernameSignin.getText().toString().equals( "" ) || etPasswordSignin.getText().toString().equals( "" ))
                    {

                        Toast.makeText(SignIn.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                    else
                    {
                        SignInrequest( etUsernameSignin.getText().toString().trim(),etPasswordSignin.getText().toString().trim() );

                    }
                }
            });
            final View rootView = findViewById(android.R.id.content).getRootView();
            rootView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
                @Override
                public void onGlobalLayout() {
                    Rect r = new Rect();
                    rootView.getWindowVisibleDisplayFrame(r);
                    int screenHeight = rootView.getRootView().getHeight();
                    int keypadHeight = screenHeight - r.bottom;

                    if (keypadHeight > screenHeight * 0.15) {
                        // Keyboard is opened, hide ImageView and TextViews
                        ivGorkan_Clip.setVisibility(View.GONE);
                    } else {
                        // Keyboard is closed, show ImageView and TextV
                        ivGorkan_Clip.setVisibility(View.VISIBLE);
                    }
                }
            });


        }, 5000 );
    }
    public void SignInrequest(String customID, String password)
    {
        progressDialog.show();
        // Create the ClientData object
        RequestClasses.FetchMorgue LoginData = new RequestClasses.FetchMorgue(customID, password);

        // Retrofit setupw
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Call the login method
        Call<ResponseClasses.LoginResponse> call = apiService.login(LoginData);

        call.enqueue(new Callback<ResponseClasses.LoginResponse>() {
            public void onResponse(Call<ResponseClasses.LoginResponse> call, Response<ResponseClasses.LoginResponse> response) {
                if (response.isSuccessful()) {
                    ResponseClasses.LoginResponse serverResponse = response.body();
                    Log.d("API Response",response.body().toString());
                    if (serverResponse != null && serverResponse.getMessage() != null) {
                        if(serverResponse.isSuccess())
                        {
                            Log.d("API Response", "Login successful");

                            morgue = serverResponse.getMorgue();
                            MainActivity.morgue = morgue;
                            Total = morgue.getTotalCabins();
                            Booked = morgue.getBookedCabins();
                            progressDialog.dismiss();
                            manager.saveMorgue(morgue,morgue.getCustomID(),password);
                            Log.d("Graveyard", "Graveyard Name: " + morgue.getCustomID());

                            //manager.saveGorkan(graveyard,customID,password);

                            Intent intent = new Intent(SignIn.this,MainActivity.class);
                            startActivity(intent);
                            finish();

                        }
                        else
                        {
                            Toast.makeText(SignIn.this, "Invalid Graveyard ID or Password", Toast.LENGTH_SHORT).show();
                        }
                        // Successful login
                    } else {
                        // Handle unexpected null response
                        Log.e("API Response", "Null or incomplete response from server");
                        progressDialog.dismiss();
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());

                    Toast.makeText(SignIn.this, "Network error", Toast.LENGTH_SHORT).show();
                    progressDialog.dismiss();
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.LoginResponse> call, Throwable t) {
                progressDialog.dismiss();
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(SignIn.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
    public void registerIP()
    {
        progressDialog.show();

// Retrofit setup
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("https://dynamic-ip.vercel.app/") // Replace with actual IP or localhost
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

// Call the services API
        Call<Map<String, String>> call = apiService.getServices();

        call.enqueue(new Callback<Map<String, String>>() {
            @Override
            public void onResponse(Call<Map<String, String>> call, Response<Map<String, String>> response) {
                if (response.isSuccessful()) {
                    Map<String, String> services = response.body();

                    Log.d("API Response", "Services fetched successfully");

                    // Fetch the "api" service specifically
                    String apiServiceAddress = services.get("api");

                    if (apiServiceAddress != null) {
                        Log.d("API Service", "API Address: " + apiServiceAddress);
                        baseURL = "http://"+apiServiceAddress + ":5006/";
                        websocketURL = "ws://" +apiServiceAddress +":5006/";
                        AIURL = "http://"+apiServiceAddress + ":5011/";
                    } else {
                        Log.e("API Response", "No services found");
                        Toast.makeText(SignIn.this, "No services available", Toast.LENGTH_SHORT).show();
                        finishAffinity(); // Closes all activities

                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());
                    Toast.makeText(SignIn.this, "Failed to fetch services", Toast.LENGTH_SHORT).show();
                }
                progressDialog.dismiss();
            }

            @Override
            public void onFailure(Call<Map<String, String>> call, Throwable t) {
                progressDialog.dismiss();
                Log.e("API Error", "Request failed: " + t.getMessage());
                Toast.makeText(SignIn.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }


}