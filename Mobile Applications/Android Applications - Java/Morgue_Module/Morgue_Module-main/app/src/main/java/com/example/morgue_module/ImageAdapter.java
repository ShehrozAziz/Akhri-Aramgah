package com.example.morgue_module;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ImageAdapter extends RecyclerView.Adapter<ImageAdapter.ViewHolder> {

    private List<ImageData> imageList;
    private Context context;

    public ImageAdapter(Context context, List<ImageData> imageList) {
        this.context = context;
        this.imageList = imageList;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_image, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        String base64String = imageList.get(position).getImageBase64();
        Bitmap bitmap = base64ToBitmap(base64String);
        holder.imageView.setImageBitmap(bitmap);

        holder.imageView.setOnLongClickListener(v -> {
            showImageDialog(position, bitmap);
            return true;
        });
        holder.imageView.setOnClickListener( new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText( context,"Long Press for Options",Toast.LENGTH_SHORT ).show();
            }
        } );
    }

    @Override
    public int getItemCount() {
        return imageList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imageView;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            imageView = itemView.findViewById(R.id.imageView);
        }
    }

    private Bitmap base64ToBitmap(String base64) {
        byte[] decodedBytes = Base64.decode(base64, Base64.DEFAULT);
        return BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
    }

    private void showImageDialog(int position, Bitmap bitmap) {
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        LayoutInflater inflater = LayoutInflater.from(context);
        View dialogView = inflater.inflate(R.layout.dialog_image, null);
        builder.setView(dialogView);

        ImageView dialogImage = dialogView.findViewById(R.id.dialogImage);
        Button btnClose = dialogView.findViewById(R.id.btnClose);
        Button btnDelete = dialogView.findViewById(R.id.btnDelete);

        dialogImage.setImageBitmap(bitmap);

        AlertDialog dialog = builder.create();
        dialog.show();

        btnClose.setOnClickListener(v -> dialog.dismiss());
        btnDelete.setOnClickListener(v -> {
            DeleteBody(imageList.get( position ).getBodyId());
            imageList.remove(position);
            notifyDataSetChanged();
            dialog.dismiss();
        });
    }
    public void DeleteBody(String OTP)
    {
        ProgressDialog progressDialog;
        progressDialog = new ProgressDialog( context );
        progressDialog.setMessage( "Loading..." );
        progressDialog.setCancelable(false);  // Prevent canceling by tapping outside
        progressDialog.setIndeterminate(true);  // Show indeterminate spinner

        progressDialog.show();
        //String baseURL = context.getString(R.string.flask_server_IP);
        // Create the ClientData object
        RequestClasses.DeleteBody BodyData = new RequestClasses.DeleteBody(OTP);

        // Retrofit setupw
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SignIn.AIURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Call the login method
        Call<ResponseClasses.ReleaseResponse> call = apiService.delete(BodyData);

        call.enqueue(new Callback<ResponseClasses.ReleaseResponse>() {
            public void onResponse(Call<ResponseClasses.ReleaseResponse> call, Response<ResponseClasses.ReleaseResponse> response) {
                if (response.isSuccessful()) {
                    ResponseClasses.ReleaseResponse serverResponse = response.body();
                    Log.d("API Response",response.body().toString());
                    if (serverResponse != null && serverResponse.getMessage() != null) {
                        if(serverResponse.isSuccess())
                        {

                            //manager.saveGorkan(graveyard,customID,password);
                            Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_LONG).show();
                            progressDialog.dismiss();
                        }
                        else
                        {
                            Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_LONG).show();
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
