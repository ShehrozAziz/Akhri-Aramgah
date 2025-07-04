package com.example.morgue_module;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.ItemTouchHelper;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class PendingOrdersFragment extends Fragment {
    RecyclerView rvPendings;

    public static TextView tvTotal;
    public static TextView tvBooked;

    MaterialButton releasecabin;

    ProgressDialog progressDialog;

    Context context;
    String baseURL;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view =  inflater.inflate(R.layout.fragment_pending_orders, container, false);
        context = view.getContext();
        tvTotal = view.findViewById( R.id.tvTotal );
        tvBooked = view.findViewById( R.id.tvBooked );
        tvTotal.setText( "Total Cabins: \n " + SignIn.Total );
        tvBooked.setText( "Booked Cabins: \n " + SignIn.Booked  );
        releasecabin = view.findViewById( R.id.release_cabin );
        progressDialog = new ProgressDialog( context );
        progressDialog.setMessage( "Loading..." );
        progressDialog.setCancelable(false);  // Prevent canceling by tapping outside
        progressDialog.setIndeterminate(true);  // Show indeterminate spinner
        //baseURL = getString( R.string.server_IP );

        releasecabin.setOnClickListener( new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(SignIn.Booked>0)
                {
                    showConfirmationDialog( context );
                }
                else
                {
                    Toast.makeText( context,"No Booked Cabin",Toast.LENGTH_SHORT ).show();
                }


            }
        } );

        /*rvPendings = view.findViewById(R.id.rvPendings);
        List<String> pendingOrders = new ArrayList<>();
        pendingOrders.add("Order 1");
        pendingOrders.add("Order 2");
        pendingOrders.add("Order 3");
        rvPendings.setLayoutManager(new LinearLayoutManager(view.getContext()));
        PendingOrdersAdapter adapter = new PendingOrdersAdapter(pendingOrders,view.getContext());
        rvPendings.setAdapter(adapter);
        ItemTouchHelper.SimpleCallback simpleCallback = new ItemTouchHelper.SimpleCallback(0, ItemTouchHelper.RIGHT) {
            @Override
            public boolean onMove(@NonNull RecyclerView recyclerView, @NonNull RecyclerView.ViewHolder viewHolder, @NonNull RecyclerView.ViewHolder target) {
                return false;
            }

            @Override
            public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
                // Prevent full swipe, reveal the buttons without removing the item
                adapter.showButtons(viewHolder.getAdapterPosition());
                adapter.notifyItemChanged(viewHolder.getAdapterPosition()); // Reset the swipe state
            }

            @Override
            public void clearView(@NonNull RecyclerView recyclerView, @NonNull RecyclerView.ViewHolder viewHolder) {
                super.clearView(recyclerView, viewHolder);
                //adapter.hideButtons(viewHolder.getAdapterPosition());
            }

            @Override
            public float getSwipeThreshold(@NonNull RecyclerView.ViewHolder viewHolder) {
                // Only allow partial swipe to reveal buttons (e.g., 0.3f means 30% of the item width)
                return 0.3f;
            }
            /*
            @Override
            public float getSwipeEscapeVelocity(float defaultValue) {
                return super.getSwipeEscapeVelocity(defaultValue) * 2; // Slow down the swipe speed
            }

            @Override
            public float getSwipeVelocityThreshold(float defaultValue) {
                return super.getSwipeVelocityThreshold(defaultValue) * 2; // Slow down the swipe release velocity
            }
        };


        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(simpleCallback);
        itemTouchHelper.attachToRecyclerView(rvPendings);*/
        // Attach swipe actions
        return  view;

    }
    private void showConfirmationDialog(Context context) {
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setTitle("Confirmation")
                .setMessage("Are you sure one cabin has been emptied or released?")
                .setPositiveButton("Yes", (dialog, which) -> {
                    // Handle the confirmation logic here
                    Clearrequest();
                    dialog.dismiss();
                })
                .setNegativeButton("No", (dialog, which) -> dialog.dismiss()) // Just close the dialog
                .setCancelable(false) // Prevents accidental dismissal
                .show();
    }
    public void Clearrequest()
    {
        progressDialog.show();
        // Create the ClientData object
        RequestClasses.ClearCabin CabinData = new RequestClasses.ClearCabin(SignIn.morgue.getMorgueId());

        // Retrofit setupw
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SignIn.baseURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Call the login method
        Call<ResponseClasses.ReleaseResponse> call = apiService.release(CabinData);

        call.enqueue(new Callback<ResponseClasses.ReleaseResponse>() {
            public void onResponse(Call<ResponseClasses.ReleaseResponse> call, Response<ResponseClasses.ReleaseResponse> response) {
                if (response.isSuccessful()) {
                    ResponseClasses.ReleaseResponse serverResponse = response.body();
                    Log.d("API Response",response.body().toString());
                    if (serverResponse != null && serverResponse.getMessage() != null) {
                        if(serverResponse.isSuccess())
                        {
                            Log.d("API Response", "Login successful");

                            //manager.saveGorkan(graveyard,customID,password);
                            Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_SHORT).show();
                            SignIn.Booked--;
                            PendingOrdersFragment.tvBooked.setText( "Booked Cabins: \n " + SignIn.Booked  );
                            progressDialog.dismiss();

                        }
                        else
                        {
                            Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_SHORT).show();
                            progressDialog.dismiss();
                        }

                        // Successful login
                    } else {
                        // Handle unexpected null response
                        Log.e("API Response", "Null or incomplete response from server");
                        progressDialog.dismiss();
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());

                    Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
                    progressDialog.dismiss();
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.ReleaseResponse> call, Throwable t) {
                progressDialog.dismiss();
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}