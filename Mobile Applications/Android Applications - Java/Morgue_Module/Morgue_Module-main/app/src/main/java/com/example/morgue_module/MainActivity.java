package com.example.morgue_module;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.viewpager2.widget.ViewPager2;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.material.badge.BadgeDrawable;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainActivity extends AppCompatActivity {

    TabLayout tabLayout;
    ViewPager2 viewPager;
    ImageButton btnMore;
    ImageButton btnLogout;
    public static BadgeDrawable Pending;

    public static Morgue morgue;
    SharedPrefsManager manager;

    public static List<ImageData> imageData;

    public static Boolean GotImages=false;


    private WebSocketClient webSocketClient;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getWindow().setStatusBarColor(ContextCompat.getColor(this, R.color.BG));
        tabLayout = findViewById(R.id.tabLayout);
        manager = new SharedPrefsManager( this );
        viewPager = findViewById(R.id.viewpager);
        imageData = new ArrayList<>();
        viewPager.setAdapter(new OrdersPagerAdapter(this));
        viewPager.setUserInputEnabled(false);
        btnMore = findViewById(R.id.btnMore);
        btnLogout = findViewById( R.id.btnLogout );
        btnLogout.setOnClickListener( v -> {
            manager.clearTransporterData();
            Intent intent = new Intent(MainActivity.this,SignIn.class);
            startActivity( intent );
            finish();
        } );

        TabLayoutMediator tLM = new TabLayoutMediator(tabLayout, viewPager, new TabLayoutMediator.TabConfigurationStrategy() {
            @Override
            public void onConfigureTab(@NonNull TabLayout.Tab tab, int position) {
                switch (position)
                {
                    case 0:
                    {
                        tab.setText("Add Body");
                        tab.setIcon(R.drawable.ic_body);
                        break;
                    }
                    case 1:
                    {
                        tab.setText("Bodies");
                        tab.setIcon(R.drawable.ic_person);
                        break;
                    }
                    case 2:
                    {
                        tab.setText("Cabins");
                        tab.setIcon(R.drawable.ic_cabin);
                        break;
                    }
                }
            }
        });

        tLM.attach();

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);

                BadgeDrawable bd = Objects.requireNonNull(tabLayout.getTabAt(position)).getOrCreateBadge();
                bd.setNumber(0);
                bd.setVisible(false);
            }
        });
        connectWebSocket();
        fetchImages(morgue.getMorgueId());

    }

    private void connectWebSocket() {
        try {
            //String baseAddress = getString(R.string.websocket_IP);

            URI uri = new URI(SignIn.websocketURL); // Replace with your server's WebSocket URL
            webSocketClient = new WebSocketClient( uri ) {
                @Override
                public void onOpen(ServerHandshake handshakedata) {
                    Log.d( "Socket", "WebSocket Opened" );
                    runOnUiThread( () -> Toast.makeText( MainActivity.this, "Connected to Server", Toast.LENGTH_SHORT ).show() );
                    ///Log.d( TAG, "ID sent to server: " + idToSend );
                }

                @SuppressLint("NotifyDataSetChanged")
                @Override
                public void onMessage(String message) {
                    Log.d( "Message", "Message received: " + message );
                    try {
                        JSONObject object = new JSONObject(message);
                        String event = object.getString( "event" );
                        String morgueId = object.getString( "morgueId" );
                        if(morgue.getMorgueId().equals( morgueId ))
                        {
                            runOnUiThread( () -> {
                                showAlertDialog( MainActivity.this);
                                SignIn.Booked++;
                                BodiesFragment.tvBooked.setText( "Booked Cabins: " + SignIn.Booked  );
                            } );
                        }
                        /*else if("bookGrave".equals( event ))
                        {
                            Parser.GraveOrder request = new Parser.GraveOrder( object.getString( "GraveID" ),object.getString( "GraveyardID" ));
                            runOnUiThread( () -> {
                                if(Objects.equals( request.getGraveyardID(), graveyard.getGraveyardId() ))
                                {
                                    orders.add( request );
                                    PendingOrdersFragment.gravesAdapter.notifyDataSetChanged();
                                    for(GraveImage obj: ConfirmedOrdersFragment.tiles)
                                    {
                                        if(obj.getId().equals( request.getGraveID() ))
                                        {
                                            obj.ChangeColor(1);
                                        }
                                    }
                                }
                            } );
                        }
                        else if("maintenanceOrders".equals( event ))
                        {

                            // Check if the event is "maintenanceOrders"
                            // Parse the data array
                            JSONArray dataArray = object.getJSONArray("data");
                            for (int i = 0; i < dataArray.length(); i++) {
                                JSONObject maintenanceObj = dataArray.getJSONObject(i);
                                String graveID = maintenanceObj.getString("GraveID");
                                String graveyardID = maintenanceObj.getString("GraveyardID");
                                // Create a new MaintenanceRequests object and add to the list
                                requests.add(new Parser.MaintenanceRequests(graveID, graveyardID));
                                Log.d( "Added Maintenance", graveID );
                            }

                            // Parse the data2 array (for GraveID only)
                            JSONArray data2Array = object.getJSONArray("data2");
                            for (int i = 0; i < data2Array.length(); i++) {
                                JSONObject graveOrderObj = data2Array.getJSONObject(i);
                                String graveID = graveOrderObj.getString("GraveID");
                                String graveyardID = graveOrderObj.getString( "GraveyardID" );
                                // Create a new GraveOrder object and add to the list
                                orders.add(new Parser.GraveOrder(graveID,graveyardID));
                                Log.d( "Added Grave Order", graveID );
                            }


                            //Log.d("Maintenances", message);
                        } */
                    } catch (JSONException e) {
                        throw new RuntimeException( e );
                    }

                }

                @Override
                public void onClose(int code, String reason, boolean remote) {
                    Log.d( "Socket Close", "WebSocket Closed: " + reason );
                    runOnUiThread( () -> Toast.makeText( MainActivity.this, "Server Closed: " + reason, Toast.LENGTH_SHORT ).show() );
                }

                @Override
                public void onError(Exception ex) {
                    Log.e( "Socket Error", "WebSocket Error: " + ex.getMessage() );
                    runOnUiThread( () -> Toast.makeText( MainActivity.this, "Server Error: " + ex.getMessage(), Toast.LENGTH_SHORT ).show() );
                }
            };
            webSocketClient.connect();
        } catch (Exception e) {
            Log.e("Exception", "Error connecting WebSocket: " + e.getMessage());
            runOnUiThread(() -> Toast.makeText(MainActivity.this, "Error Connecting Server: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        }
    }
    public void fetchImages(String morgueID) {
        //String baseaddress = getString( R.string.flask_server_IP );
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SignIn.AIURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        Call<ResponseClasses.ImageResponse> call = apiService.getImages(morgueID);

        call.enqueue(new Callback<ResponseClasses.ImageResponse>() {
            public void onResponse(Call<ResponseClasses.ImageResponse> call, Response<ResponseClasses.ImageResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ResponseClasses.ImageResponse serverResponse = response.body();
                    Log.d("API Response", response.body().toString());

                    if (serverResponse.isSuccess()) {
                        List<ImageData> images = serverResponse.getImages();
                        if (images != null && !images.isEmpty()) {
                            Log.d("API Response", "Images received: " + images.size());
                            for (ImageData img : images) {
                                Log.d("Image", "ID: " + img.getBodyId() + ", Base64: " + img.getImageBase64());
                            }
                            imageData = images;
                            BodiesFragment.hidden.setText("Call");
                        } else {
                            Log.d("API Response", "No images found.");
                            Toast.makeText(MainActivity.this, "No images found", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        Log.d("API Response", serverResponse.getMessage());
                        Toast.makeText(MainActivity.this, serverResponse.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());
                    Toast.makeText(MainActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.ImageResponse> call, Throwable t) {
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(MainActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
    private void showAlertDialog(Context context) {
        // Inflate the custom layout
        LayoutInflater inflater = LayoutInflater.from(context);
        View view = inflater.inflate(R.layout.new_order_alert, null);

        // Get references to the TextViews and Button
        TextView alertTitle = view.findViewById(R.id.alertTitle);
        TextView alertMessage = view.findViewById(R.id.alertMessage);
        Button btnAccept = view.findViewById(R.id.btnAccept);

        // Create AlertDialog
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setView(view);

        AlertDialog alertDialog = builder.create();

        // Accept button closes the dialog
        btnAccept.setOnClickListener(v -> alertDialog.dismiss());

        // Show the dialog
        alertDialog.show();
    }
}