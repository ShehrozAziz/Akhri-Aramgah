package com.example.gorkan_module;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.content.res.ResourcesCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.viewpager2.widget.ViewPager2;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.MenuItem;
import android.view.View;
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

public class MainActivity extends AppCompatActivity {

    TabLayout tabLayout;
    ViewPager2 viewPager;
    ImageButton btnMore;
    public static BadgeDrawable Pending;
    public static Graveyard graveyard;

    public static ArrayList<Grave> graves;

    public static ArrayList<Parser.MaintenanceRequests> requests;
    public static ArrayList<Parser.GraveOrder> orders;

    Context context;


    private WebSocketClient webSocketClient;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        context = MainActivity.this;

        ConfirmedOrdersFragment.tiles = new ArrayList<GraveImage>();

        PendingOrdersFragment.gravesAdapter = new PendingOrdersAdapter(orders,context);
        PendingMaintainanceOrderFragment.maintenanceAdapter = new MaintenancePendingOrdersAdapter(requests,context);




        requests = new ArrayList<Parser.MaintenanceRequests>();
        orders = new ArrayList<Parser.GraveOrder>();
        connectWebSocket();
        getWindow().setStatusBarColor(ContextCompat.getColor(this, R.color.BG));
        tabLayout = findViewById(R.id.tabLayout);
        viewPager = findViewById(R.id.viewpager);
        viewPager.setAdapter(new OrdersPagerAdapter(this));
        viewPager.setUserInputEnabled(false);
        btnMore = findViewById(R.id.btnLogout);
        btnMore.setOnClickListener( new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                TextView messageTextView = new TextView(context);
                messageTextView.setText("Do you really want to logout?");
                messageTextView.setTextSize(18); // Set the desired text size
                messageTextView.setPadding(50, 50, 50, 20); // Set padding for left and right margins
                messageTextView.setGravity( Gravity.CENTER); // Center the text
                // Set custom font
                messageTextView.setTypeface( ResourcesCompat.getFont(v.getContext(), R.font.poppins_medium));  // Apply Poppins font
                // Create the AlertDialog
                AlertDialog.Builder builder = new AlertDialog.Builder(context);
                builder.setView(messageTextView);
                builder.setCancelable(true); // Allow canceling the dialog by tapping outside or pressing back
                // Set Positive Button
                builder.setPositiveButton("Yes", (dialog, which) -> {
                    // Handle logout action here
                    SharedPrefsManager manager = new SharedPrefsManager( context );
                    manager.clearTransporterData();
                    dialog.dismiss();
                    Intent intent = new Intent(MainActivity.this,SignIn.class);
                    startActivity( intent );
                    finish();
                });

                // Set Negative Button
                builder.setNegativeButton("No", (dialog, which) -> dialog.dismiss());

                // Create and show the AlertDialog
                AlertDialog dialog = builder.create();
                dialog.show();
            }
        } );
        TabLayoutMediator tLM = new TabLayoutMediator(tabLayout, viewPager, new TabLayoutMediator.TabConfigurationStrategy() {
            @Override
            public void onConfigureTab(@NonNull TabLayout.Tab tab, int position) {
                switch (position)
                {
                    case 0:
                    {
                        tab.setText("Graveyard Map");
                        tab.setIcon(R.drawable.ic_map);
                        break;
                    }
                    case 1:
                    {
                        tab.setText("Bookings");
                        tab.setIcon(R.drawable.ic_pending);
                        Pending = tab.getOrCreateBadge();
                        Pending.setMaxCharacterCount(3);
                        Pending.setNumber(20);
                        Pending.setVisible(true);
                        break;
                    }
                    case 2:
                    {
                        tab.setText("Maintenances");
                        tab.setIcon(R.drawable.ic_pending);
                        Pending = tab.getOrCreateBadge();
                        Pending.setMaxCharacterCount(3);
                        Pending.setNumber(20);
                        Pending.setVisible(true);
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

    }
    private void connectWebSocket() {
        try {
            URI uri = new URI(SignIn.websocketURL); // Replace with your server's WebSocket URL
            webSocketClient = new WebSocketClient( uri ) {
                @Override
                public void onOpen(ServerHandshake handshakedata) {
                    Log.d( "Socket", "WebSocket Opened" );
                    runOnUiThread( () -> Toast.makeText( MainActivity.this, "Connected to Server", Toast.LENGTH_SHORT ).show() );
                    String id = MainActivity.graveyard.getGraveyardId(); // Replace with your ID value
                    if(webSocketClient!=null)
                    {
                        webSocketClient.send(id);
                    }
                    ///Log.d( TAG, "ID sent to server: " + idToSend );
                }

                @SuppressLint("NotifyDataSetChanged")
                @Override
                public void onMessage(String message) {
                    Log.d( "Message", "Message received: " + message );
                    try {
                        JSONObject object = new JSONObject(message);
                        String event = object.getString( "event" );
                        if("maintenanceRequest".equals( event ))
                        {
                            Parser.MaintenanceRequests request = new Parser.MaintenanceRequests(object.getString( "GraveID" ),object.getString( "GraveyardID" ));
                            //Log.d( "Maintenance" ,"Of " + request.getGraveID() + " in " + request.getGraveyardID());
                            runOnUiThread( () -> {
                                if(Objects.equals( request.getGraveyardID(), graveyard.getGraveyardId() ))
                                {
                                    requests.add( request );
                                    PendingMaintainanceOrderFragment.maintenanceAdapter.notifyDataSetChanged();
                                }
                            } );
                        }
                        else if("bookGrave".equals( event ))
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
                        }
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
}