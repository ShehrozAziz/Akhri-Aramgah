package com.example.gorkan_module;

import static com.example.gorkan_module.SignIn.baseURL;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.ImageButton;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Map;
import java.util.logging.Handler;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ConfirmedOrdersFragment extends Fragment {
    GridLayout gridLayout1;
    GridLayout gridLayout2;
    public static int numRows = 18;
    public static int numCols = 30;
    Context context;

    public static ArrayList<GraveImage> tiles;

    ProgressDialog progressDialog;
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
    {



        View view = inflater.inflate(R.layout.fragment_confirmed_orders, container, false);
        context = view.getContext();
        progressDialog = new ProgressDialog( context );
        progressDialog.setMessage( "Loading..." );
        progressDialog.setCancelable(false);  // Prevent canceling by tapping outside
        progressDialog.setIndeterminate(true);  // Show indeterminate spinner
        progressDialog.show();
        FetchGraves();
        gridLayout1 = view.findViewById(R.id.gridLayout1);
        gridLayout2 = view.findViewById(R.id.gridLayout2);
        gridLayout1.setColumnCount(numCols+ numCols/4);
        gridLayout2.setColumnCount(numCols);

        //addImageButtons2((int) (numRows * 1.5),numCols);
        return view;
    }
    private void addImageButtons(int rows, int cols) {
        ArrayList<Grave> sorted = new ArrayList<>();
        sorted = sortGraves(MainActivity.graves);
        int additionrows = rows/4;
        int additioncols = cols/4;
        int counter = 0;
        int i = 0; // Row counter
        int realrow = 0;
        while (i < rows + additionrows) {
            int j = 0; // Column counter
            int realcol = 0;
            while (j < cols + additioncols) {
                ImageButton imageButton = new ImageButton(context);
                if((i+1) % 5 ==0)
                {
                    imageButton.setImageResource( R.drawable.ic_grave );
                    imageButton.setVisibility( View.INVISIBLE );
                }
                // Determine if the current position is a path (space for path after every 4 rows/columns)
                else if ((j + 1) % 5 == 0) {
                    // Path space (invisible drawable)
                    imageButton.setImageResource(R.drawable.ic_grave);
                    imageButton.setVisibility(View.INVISIBLE); // Make it non-clickable and invisible
                } else {
                    // Grave space
                    imageButton.setImageResource(R.drawable.ic_grave); // Replace with your grave drawable
                    imageButton.setBackgroundResource(android.R.color.transparent); // Transparent background
                    String message = null;
                    /*for(Grave grave: MainActivity.graves)
                    {
                        if(grave.getId().equals( "r"+realrow+1+"c"+realcol+1 ));
                        {
                            Log.d("Grave ID", "r"+realrow+1+"c"+realcol+1);
                            if(grave.getStatus().equals("booked"))
                            {
                                imageButton.setImageTintList(ColorStateList.valueOf(Color.parseColor("#673AB7")));
                                message="Grave ID " + grave.getId() + " in the Progress of Burial"; // Set the tint to #FF6F6F
                            }
                            else if(grave.getStatus().equals("Completed"))
                            {
                                imageButton.setImageTintList(ColorStateList.valueOf(Color.parseColor("#FF6F6F")));
                                message="Grave ID " + grave.getId() + " Completed and Filled";
                            }
                            else
                            {
                                imageButton.setImageTintList(ColorStateList.valueOf(Color.parseColor("#00BCD4")));
                                message="Grave ID " + grave.getId() + " is Empty for Burial";
                            }

                        }
                    }*/
                    Grave grave = sorted.get( counter );
                    Log.d("Grave ID", grave.getId());
                    if(grave.getStatus().equals("booked"))
                    {
                        imageButton.setImageTintList(ColorStateList.valueOf(Color.parseColor("#673AB7")));
                        message="Grave ID " + grave.getId() + " in the Progress of Burial"; // Set the tint to #FF6F6F
                    }
                    else if(grave.getStatus().equals("Completed"))
                    {
                        imageButton.setImageTintList(ColorStateList.valueOf(Color.parseColor("#FF6F6F")));
                        message="Grave ID " + grave.getId() + " Completed and Filled";
                    }
                    else
                    {
                        imageButton.setImageTintList(ColorStateList.valueOf(Color.parseColor("#4CAF50")));
                        message="Grave ID " + grave.getId() + " is Empty for Burial";
                    }
                    tiles.add(new GraveImage(context,grave.getId(),message,imageButton,grave));
                    counter++;



                    // Calculate the actual row and column indices (excluding paths)
                    int adjustedRow = realrow+1;
                    int adjustedCol = realcol+1;

                    // Set onClick and onLongClick listeners for graves

                }

                // Set layout parameters for the button
                GridLayout.LayoutParams params = new GridLayout.LayoutParams();
                params.width = 60; // Set width for each button
                params.height = 130; // Set height for each button
                //params.setMargins(4, 4, 4, 4); // Add consistent margins
                imageButton.setLayoutParams(params);

                // Add the button to the grid layout
                gridLayout1.addView(imageButton);

                // Increment the column counter only if it's not a path
                if ((j + 1) % 5 != 0) {
                    j++;
                    realcol++;
                } else {
                    j++; // Skip the path space
                }
            }

            // Increment the row counter only if it's not a path
            if ((i + 1) % 5 != 0) {
                i++;
                realrow++;
            } else {
                i++; // Skip the path space
            }
        }
        progressDialog.dismiss();
    }



    private void addImageButtons2(int rows, int cols) {
        int numberOfSets = rows / 4;
        int totalRowsWithAdditions = rows + numberOfSets;
        for (int i = 1; i < totalRowsWithAdditions + 1 ; i++) {
            if (i % 7 == 0 ) {
                if(i>totalRowsWithAdditions-3)
                {
                    continue;
                }
                for (int j = 0; j < cols; j++) {
                    ImageButton imageButton = new ImageButton(context);
                    if (j == cols-1) {
                        imageButton.setImageResource(R.drawable.ic_gate_2);
                        imageButton.setRotation(180);
                    } else {
                        imageButton.setImageResource(R.drawable.ic_grave);
                        imageButton.setVisibility(View.INVISIBLE);
                    }
                    imageButton.setBackgroundResource(android.R.color.transparent); // Transparent background
                    imageButton.setPadding(0, 0, 0, 0);
                    // Set layout parameters (optional: adjust size)
                    GridLayout.LayoutParams params = new GridLayout.LayoutParams();
                    params.width = 36;  // Set width for each button
                    params.height = ViewGroup.LayoutParams.WRAP_CONTENT; // Set height for each button
                    int additionaltop = 0;
                    int additionalend = 0;
                    params.setMargins(4, 0 + additionaltop, 4 + additionalend, 0);
                    imageButton.setLayoutParams(params);
                    int finalI = i;
                    int finalJ = j;
                    gridLayout2.addView(imageButton);
                }
            }
            else
            {
                for (int j = 1; j < cols + 1; j++) {
                    ImageButton imageButton = new ImageButton(context);
                    imageButton.setImageResource(R.drawable.ic_grave_small); // Replace with your image
                    imageButton.setBackgroundResource(android.R.color.transparent); // Transparent background
                    imageButton.setPadding(0, 0, 0, 0);
                    GridLayout.LayoutParams params = new GridLayout.LayoutParams();
                    params.width = 36;
                    params.height = ViewGroup.LayoutParams.WRAP_CONTENT;
                    int additionaltop = 0;
                    int additionalend = 0;
                    if(j%15==0 && j!=0)
                    {
                        if(j<cols-7)
                        {
                            additionalend = 60;
                        }
                    }
                    params.setMargins(4, 4 + additionaltop, 4 +additionalend, 0);

                    imageButton.setLayoutParams(params);
                    int finalI = i;
                    int finalJ = j;
                    imageButton.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            smallclickongrave("Hello");
                        }
                    });
                    imageButton.setOnLongClickListener(new View.OnLongClickListener() {
                        @Override
                        public boolean onLongClick(View v) {
                            //longclickongrave(finalI*finalJ);
                            return false;
                        }
                    });
                    gridLayout2.addView(imageButton);
                }
            }
        }
    }
    public static ArrayList<Grave> sortGraves(ArrayList<Grave> graves) {
        Collections.sort(graves, new Comparator<Grave>() {
            @Override
            public int compare(Grave grave1, Grave grave2) {
                // Extract row and column from the id of each grave
                int row1 = Integer.parseInt(grave1.getId().substring(1, grave1.getId().indexOf('c')));
                int col1 = Integer.parseInt(grave1.getId().substring(grave1.getId().indexOf('c') + 1));
                int row2 = Integer.parseInt(grave2.getId().substring(1, grave2.getId().indexOf('c')));
                int col2 = Integer.parseInt(grave2.getId().substring(grave2.getId().indexOf('c') + 1));

                // First compare rows, then compare columns
                if (row1 != row2) {
                    return Integer.compare(row1, row2);
                } else {
                    return Integer.compare(col1, col2);
                }
            }
        });
        return graves;
    }
    public void smallclickongrave(String message)
    {

        Toast.makeText(context, message, Toast.LENGTH_LONG).show();
        //Toast.makeText(context, "Long Press For Grave Info Panel", Toast.LENGTH_SHORT).show();
    }
    public void longclickongrave(String message)
    {


    }
    public void FetchGraves()
    {
        // Create the ClientData object
        RequestClasses.FetchGraves GravesData = new RequestClasses.FetchGraves(MainActivity.graveyard.getGraveyardId());

        // Retrofit setupw
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SignIn.baseURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Call the login method
        Call<ResponseClasses.FetchGravesResponse> call = apiService.fetchgraves(GravesData);

        call.enqueue(new Callback<ResponseClasses.FetchGravesResponse>() {
            public void onResponse(Call<ResponseClasses.FetchGravesResponse> call, Response<ResponseClasses.FetchGravesResponse> response) {
                if (response.isSuccessful()) {
                    ResponseClasses.FetchGravesResponse serverResponse = response.body();
                    Log.d("API Response",response.body().toString());
                    if (serverResponse != null && serverResponse.getMessage() != null) {
                        // Successful login
                        Log.d("API Response", "Login successful");
                        Map<String, Grave> gravesMap = serverResponse.getGraves();
                        ArrayList<Grave> graveList = new ArrayList<>(gravesMap.values());
                        MainActivity.graves = graveList;
                        addImageButtons(numRows, numCols);

                        // Log each grave



                    } else {
                        // Handle unexpected null response
                        Log.e("API Response", "Null or incomplete response from server");
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.FetchGravesResponse> call, Throwable t) {
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

}