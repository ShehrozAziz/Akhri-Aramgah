package com.example.gorkan_module;

import static com.example.gorkan_module.SignIn.baseURL;
import static com.example.gorkan_module.SignIn.graveyard;

import android.animation.Animator;
import android.animation.ValueAnimator;
import android.content.Context;
import android.content.DialogInterface;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.card.MaterialCardView;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class PendingOrdersAdapter extends RecyclerView.Adapter<PendingOrdersAdapter.PendingViewHolder> {
    private List<Parser.GraveOrder> orders;
    private Context context;
    private int openedPosition = -1;  // No item is opened initially
    private int swipedPosition = -1;

    public PendingOrdersAdapter(List<Parser.GraveOrder> orders, Context context) {
        this.orders = orders;
        this.context = context;
    }

    @NonNull
    @Override
    public PendingViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.single_pending_order, parent, false);
        return new PendingViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PendingViewHolder holder, int position) {
        Parser.GraveOrder order = orders.get(position);
        holder.tvGraveID.setText("ID: " + order.getGraveID());
        String[] parts = order.getGraveID().split("r|c");  // Split by 'r' and 'c'
        String row = parts[1];
        String column = parts[2];
        holder.tvRow.setText( "Row Number: " + row );
        holder.tvColumn.setText( "Column Number: " + column );
        holder.tvStatus.setText("Not Prepared");

        if (position == swipedPosition) {
            holder.btnMoreInfo2.setVisibility(View.VISIBLE);
            holder.btnswipe.setText("Close ⬇\uFE0F");
            holder.tvColumn.setVisibility(View.INVISIBLE);
            holder.tvRow.setVisibility(View.INVISIBLE);
            holder.btnswipe.setClickable(true);
        } else {
            holder.btnMoreInfo2.setVisibility(View.GONE);
            holder.btnswipe.setText("Swipe ⬆\uFE0F");
            holder.btnswipe.setClickable(false);
            holder.tvColumn.setVisibility(View.VISIBLE);
            holder.tvRow.setVisibility(View.VISIBLE);
        }

        holder.btnMoreInfo2.setOnClickListener( new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AlertDialog.Builder builder = new AlertDialog.Builder(v.getContext());
                builder.setTitle("Grave Booking Confirmation");
                builder.setMessage("Preparation for the Grave ID: " + order.getGraveID() + " is done. Confirm?");

                // Positive button (Yes)
                builder.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Logic when user confirms maintenance
                        Completion( order.getGraveID(),order);
                        for(GraveImage obj: ConfirmedOrdersFragment.tiles)
                        {
                            if(obj.getId().equals( order.getGraveID() ))
                            {
                                obj.ChangeColor(2);
                            }
                        }
                        //orders.remove( order );
                        //notifyDataSetChanged();
                        dialog.dismiss();
                    }
                });

                // Negative button (No)
                builder.setNegativeButton("No", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        // Logic when user cancels
                        dialog.dismiss();
                    }
                });

                // Show the AlertDialog
                AlertDialog dialog = builder.create();
                dialog.show();
            }
        } );

        // Check if the current position is the opened one
        if (holder.getAdapterPosition() == openedPosition) {
            // Show the "More Info" button and set the swipe button text to "Close"

            collapseView(holder.mcvTextualArea,holder.btnMoreInfo);

            //resizeParent(holder.itemView, true);
        } else {
            // Hide the "More Info" button and set the swipe button text to "More Info"
            expandView(holder.mcvTextualArea,holder.btnMoreInfo);

            //resizeParent(holder.itemView, false);
        }

        // Handle the swipe button click
        holder.btnswipe.setOnClickListener(v -> {
            if (swipedPosition == holder.getAdapterPosition()) {
                // If this item is already opened, close it
                swipedPosition = -1;
                notifyItemChanged(holder.getAdapterPosition());
            }
        });
    }
    public void Completion(String GraveID, Parser.GraveOrder grave)
    {
        // Create the ClientData object
        RequestClasses.CompleteOrder Data = new RequestClasses.CompleteOrder("grave",GraveID,MainActivity.graveyard.getGraveyardId());

        // Retrofit setupw
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SignIn.baseURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Call the login method
        Call<ResponseClasses.CompleteResponse> call = apiService.completeorder(Data);

        call.enqueue(new Callback<ResponseClasses.CompleteResponse>() {
            public void onResponse(Call<ResponseClasses.CompleteResponse> call, Response<ResponseClasses.CompleteResponse> response) {
                if (response.isSuccessful()) {
                    ResponseClasses.CompleteResponse serverResponse = response.body();
                    Log.d("API Response",response.body().toString());
                    if (serverResponse != null && serverResponse.getMessage() != null) {
                        // Successful login
                        Log.d("API Response", "Booking successful");
                        Toast.makeText(context, "Preparation confirmed for Grave ID: " + GraveID, Toast.LENGTH_SHORT).show();
                        orders.remove(grave);
                        notifyDataSetChanged();
                    } else {
                        // Handle unexpected null response
                        Log.e("API Response", "Null or incomplete response from server");
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.CompleteResponse> call, Throwable t) {
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // Helper method to animate the visibility of the button (fade in/out)
    // Method to expand the Textual area and hide the btnMoreInfo button
    private void expandView(final View textualArea, final View btnMoreInfo) {
        // Hide the More Info button
        btnMoreInfo.setVisibility(View.GONE);

        // Measure the parent width to expand to full width
        ViewGroup parent = (ViewGroup) textualArea.getParent();
        final int targetWidth = parent.getMeasuredWidth(); // Full width

        // Animate the width of the Textual area to match parent
        ValueAnimator widthAnimator = ValueAnimator.ofInt(textualArea.getWidth(), targetWidth);
        widthAnimator.addUpdateListener(valueAnimator -> {
            ViewGroup.LayoutParams layoutParams = textualArea.getLayoutParams();
            layoutParams.width = (int) valueAnimator.getAnimatedValue();
            textualArea.setLayoutParams(layoutParams);
        });

        // Set duration for smooth animation
        widthAnimator.setDuration(200);
        widthAnimator.start();
    }
    public void showButtons(int position) {
        swipedPosition = position;
        notifyDataSetChanged();
    }

    public void hideButtons(int position) {
        if (swipedPosition == position) {
            swipedPosition = -1;
        }
        notifyDataSetChanged();
    }
    // Method to collapse the Textual area and show the btnMoreInfo button
    private void collapseView(final View textualArea, final View btnMoreInfo) {
        // Get the full width of the parent layout and the width of btnMoreInfo
        ViewGroup parent = (ViewGroup) textualArea.getParent();
        int totalParentWidth = parent.getMeasuredWidth();
        int buttonWidth = btnMoreInfo.getMeasuredWidth();

        // Target width is the parent's width minus the button's width
        int targetWidth = totalParentWidth - buttonWidth;

        // Animate the width of the Textual area to accommodate the More Info button
        ValueAnimator widthAnimator = ValueAnimator.ofInt(textualArea.getWidth(), targetWidth);
        widthAnimator.addUpdateListener(valueAnimator -> {
            ViewGroup.LayoutParams layoutParams = textualArea.getLayoutParams();
            layoutParams.width = (int) valueAnimator.getAnimatedValue();
            textualArea.setLayoutParams(layoutParams);
        });

        // Set listener to show the More Info button once the animation ends
        widthAnimator.addListener(new ValueAnimator.AnimatorListener() {
            @Override
            public void onAnimationEnd(@NonNull Animator animation) {
                btnMoreInfo.setVisibility(View.VISIBLE);
            }

            @Override
            public void onAnimationStart(@NonNull Animator animation) {}

            @Override
            public void onAnimationCancel(@NonNull Animator animation) {}

            @Override
            public void onAnimationRepeat(@NonNull Animator animation) {}
        });

        // Set duration for smooth animation
        widthAnimator.setDuration(200);
        widthAnimator.start();
    }


    @Override
    public int getItemCount() {
        return orders.size();
    }

    // Resizing logic for opening and closing the parent layout
    private void resizeParent(View itemView, boolean expand) {
        final ViewGroup parentLayout = (ViewGroup) itemView;

        int totalParentWidth = parentLayout.getWidth();
        MaterialCardView btnMoreInfo = parentLayout.findViewById(R.id.btnMoreInfo);
        int buttonWidth = btnMoreInfo.getWidth();

        // Animate the width of the parent layout to either expand or collapse
        int targetWidth = expand ? totalParentWidth - buttonWidth : totalParentWidth;

        ValueAnimator animator = ValueAnimator.ofInt(parentLayout.getWidth(), targetWidth);
        animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator valueAnimator) {
                // Dynamically set the width of the parent layout during the animation
                ViewGroup.LayoutParams layoutParams = parentLayout.getLayoutParams();
                layoutParams.width = (int) valueAnimator.getAnimatedValue();
                parentLayout.setLayoutParams(layoutParams);
            }
        });

        // Set duration for smooth animation (in milliseconds)
        animator.setDuration(500); // Adjust duration if needed for smoother animation

        // Start the animation
        animator.start();
    }

    public static class PendingViewHolder extends RecyclerView.ViewHolder {
        TextView tvGraveID,tvRow,tvColumn,tvStatus;

        Button btnswipe;
        MaterialCardView btnMoreInfo,mcvTextualArea,btnMoreInfo2;

        public PendingViewHolder(@NonNull View itemView) {
            super(itemView);
            tvGraveID = itemView.findViewById(R.id.tvGraveID);
            btnswipe = itemView.findViewById(R.id.tvSwipeIndicator);
            btnMoreInfo = itemView.findViewById(R.id.btnMoreInfo);
            mcvTextualArea = itemView.findViewById(R.id.mcvtextualarea);
            tvRow = itemView.findViewById( R.id.tvRow );
            tvColumn = itemView.findViewById( R.id.tvColumn );
            tvStatus = itemView.findViewById(R.id.tvOrderStatus);
            btnMoreInfo2 = itemView.findViewById(R.id.btnMoreInfo2);
        }
    }
}
