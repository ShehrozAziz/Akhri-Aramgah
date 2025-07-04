package com.example.morgue_module;

import static android.app.Activity.RESULT_OK;

import static com.example.morgue_module.SignIn.baseURL;
import static com.example.morgue_module.SignIn.morgue;

import android.Manifest;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.MediaStore;
import android.text.Layout;
import android.util.Base64;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class BodiesFragment extends Fragment {

    private ImageView BodyPicture;

    private TextInputEditText deleteOtp;
    private Uri photoUri;
    public Context context;
    public static TextView tvTotal;
    public static TextView tvBooked;

    public static EditText hidden;

    MaterialButton releasecabin;


    private final int CAMERA_REQ_CODE = 100;
    private final int GALLERY_REQ_CODE = 200;
    ProgressDialog progressDialog;
    MaterialButton uploadbutton;
    MaterialButton deletebutton;

    Button selectImageButton;

    Boolean gotImage;

    String baseURL;

    String uploadBase64;


    private final ActivityResultLauncher<Intent> imagePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Uri selectedImageUri = result.getData().getData();
                    if (selectedImageUri != null) {
                        try {
                            Bitmap bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), selectedImageUri);
                            BodyPicture.setImageBitmap(bitmap);  // Display selected image
                        } catch (IOException e) {
                            e.printStackTrace();

                        }
                    } else if (photoUri != null) {  // Handle camera capture
                        BodyPicture.setImageURI(photoUri);  // Display captured image
                        Toast.makeText(context, "Image Captured", Toast.LENGTH_SHORT).show();

                    }
                }
                else
                {
                    Toast.makeText(context, "Image Does not Got", Toast.LENGTH_SHORT).show();
                }
            });

    private void showImagePickerDialog() {
        // Inflate the custom layout
        View view = LayoutInflater.from(getContext()).inflate(R.layout.uploadorclick_layout, null); // Inflate your custom layout

        BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(getContext());
        bottomSheetDialog.setContentView(view);
        bottomSheetDialog.show();


        // Get references to the buttons inside the custom layout
        LinearLayout btnClick = view.findViewById(R.id.btnClick);
        LinearLayout btnUpload = view.findViewById(R.id.btnUpload);

        // Create and show the dialog

        // Set onClick listeners for both buttons
        btnClick.setOnClickListener(v -> {
            // Handle camera capture button click

            Intent iCamera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            startActivityForResult(iCamera,CAMERA_REQ_CODE);
            bottomSheetDialog.dismiss();
            // Add your code to open the camera here
        });

        btnUpload.setOnClickListener(v -> {
            // Handle upload button click
            Intent iPick = new Intent(Intent.ACTION_PICK);
            iPick.setData(MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(iPick,GALLERY_REQ_CODE);
            bottomSheetDialog.dismiss();// Add your code to open the gallery picker here
        });
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_bodies, container, false);
        BodyPicture = view.findViewById(R.id.BodyPicture);
        selectImageButton = view.findViewById(R.id.select_image_button);
        uploadbutton = view.findViewById( R.id.upload_image_button );
        gotImage = false;
        uploadbutton.setVisibility( View.GONE );

        context = getContext();
        tvTotal = view.findViewById( R.id.tvTotal2 );
        tvBooked = view.findViewById( R.id.tvBooked2 );
        tvTotal.setText( "Total Cabins: " + SignIn.Total );
        tvBooked.setText( "Booked Cabins: " + SignIn.Booked  );
        releasecabin = view.findViewById( R.id.release_cabin2 );

        progressDialog = new ProgressDialog( context );
        progressDialog.setMessage( "Loading..." );
        progressDialog.setCancelable(false);  // Prevent canceling by tapping outside
        progressDialog.setIndeterminate(true);  // Show indeterminate spinner
        baseURL = getString( R.string.server_IP );

        hidden = view.findViewById( R.id.ethiddenwatcher );
        new Handler().postDelayed( ()-> {
            fetchImages( morgue.getMorgueId() );

        },1000);

        //deleteOtp = view.findViewById( R.id.delete_otp );
        //deletebutton = view.findViewById( R.id.delete_image_button );
        /*deletebutton.setOnClickListener(v -> {
            if(Objects.requireNonNull( deleteOtp.getText() ).toString().equals( "" ))
            {
                Toast.makeText( context, "Please Enter OTP", Toast.LENGTH_SHORT ).show();
            }
            else {
                DeleteBody(deleteOtp.getText().toString().trim());
            }
        } ); */
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


        selectImageButton.setOnClickListener(v -> {
            if(checkPermissions())
            {
                showImagePickerDialog();
            }
        });
        uploadbutton.setOnClickListener( v -> {
            if(!gotImage)
            {
                Toast.makeText( context, "Upload or Click Image First", Toast.LENGTH_SHORT ).show();
            }
            else
            {
                UploadBody( uploadBase64,SignIn.morgue.getName() );

            }
        } );
        return view;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(resultCode  == RESULT_OK)
        {
            if(requestCode == CAMERA_REQ_CODE)
            {
                assert data != null;
                Bitmap img = (Bitmap) Objects.requireNonNull(data.getExtras()).get("data");
                BodyPicture.setImageBitmap(img);
                gotImage = true;
                // Convert Bitmap to Base64
                assert img != null;
                String base64String = bitmapToBase64(img);
                Log.d("Base64", base64String);
                uploadBase64 = base64String;
                uploadbutton.setVisibility( View.VISIBLE );
                selectImageButton.setVisibility( View.GONE );
                // Print or send this to server
            }
            else if(requestCode == GALLERY_REQ_CODE)
            {
                assert data != null;
                BodyPicture.setImageURI(data.getData());
                gotImage = true;
                Uri imageUri = data.getData();
                BodyPicture.setImageURI(imageUri);

                try {
                    // Convert URI to Base64
                    String base64String = uriToBase64(imageUri);
                    Log.d("Base64", base64String);  // Print or send this to server
                    uploadBase64 = base64String;

                    uploadbutton.setVisibility( View.VISIBLE );
                    selectImageButton.setVisibility( View.GONE );
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    public void UploadBody(String Base64, String MorgueName)
    {
        progressDialog.show();
        // Create the ClientData object
        RequestClasses.SendBody BodyData = new RequestClasses.SendBody(SignIn.morgue.getName(),SignIn.morgue.getMorgueId(),Base64);

        // Retrofit setupw
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SignIn.AIURL)
                .addConverterFactory( GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Call the login method
        Call<ResponseClasses.ReleaseResponse> call = apiService.upload(BodyData);

        call.enqueue(new Callback<ResponseClasses.ReleaseResponse>() {
            public void onResponse(Call<ResponseClasses.ReleaseResponse> call, Response<ResponseClasses.ReleaseResponse> response) {
                if (response.isSuccessful()) {
                    ResponseClasses.ReleaseResponse serverResponse = response.body();
                    Log.d("API Response",response.body().toString());
                    if (serverResponse != null && serverResponse.getMessage() != null) {
                        if(serverResponse.isSuccess())
                        {

                            //manager.saveGorkan(graveyard,customID,password);
                            Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_SHORT).show();
                            progressDialog.dismiss();
                            uploadbutton.setVisibility( View.GONE );
                            selectImageButton.setVisibility( View.VISIBLE );
                            BodyPicture.setImageResource(R.drawable.morgue_clip );
                            gotImage = false;
                            fetchImages( morgue.getMorgueId());
                        }
                        else
                        {
                            Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_SHORT).show();
                            progressDialog.dismiss();
                            uploadbutton.setVisibility( View.GONE );
                            selectImageButton.setVisibility( View.VISIBLE );
                            BodyPicture.setImageResource(R.drawable.morgue_clip );
                            gotImage = false;
                        }

                        // Successful login
                    } else {
                        // Handle unexpected null response
                        Log.e("API Response", "Null or incomplete response from server");
                        progressDialog.dismiss();

                        uploadbutton.setVisibility( View.GONE );
                        selectImageButton.setVisibility( View.VISIBLE );


                        BodyPicture.setImageResource(R.drawable.morgue_clip );
                        gotImage = false;
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());

                    Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
                    progressDialog.dismiss();

                    uploadbutton.setVisibility( View.GONE );
                    selectImageButton.setVisibility( View.VISIBLE );


                    BodyPicture.setImageResource(R.drawable.morgue_clip );
                    gotImage = false;
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.ReleaseResponse> call, Throwable t) {
                progressDialog.dismiss();
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
                uploadbutton.setVisibility( View.GONE );
                selectImageButton.setVisibility( View.VISIBLE );

                BodyPicture.setImageResource(R.drawable.morgue_clip );
                gotImage = false;

            }


        });
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
                            BodiesFragment.tvBooked.setText( "Booked Cabins: " + SignIn.Booked  );
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

    private String uriToBase64(Uri uri) throws IOException {
        Bitmap bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
        return bitmapToBase64(bitmap);
    }

    private String bitmapToBase64(Bitmap bitmap) {
        progressDialog.show();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 50, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        progressDialog.dismiss();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }

    // Check necessary permissions for camera and storage access
    private boolean checkPermissions() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(getActivity(),
                    new String[]{Manifest.permission.CAMERA, Manifest.permission.READ_EXTERNAL_STORAGE}, 100);
            return false;
        }
        return true;
    }
    public void fetchImages(String morgueID) {
        progressDialog.show();
        String baseaddress = getString( R.string.flask_server_IP );
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
                            MainActivity.imageData = images;
                            hidden.setText("Call");
                            progressDialog.dismiss();
                        } else {
                            Log.d("API Response", "No images found.");
                            //Toast.makeText(context, "No images found", Toast.LENGTH_SHORT).show();
                            progressDialog.dismiss();
                        }
                    } else {
                        Log.d("API Response", serverResponse.getMessage());
                        Toast.makeText(context, serverResponse.getMessage(), Toast.LENGTH_SHORT).show();
                        progressDialog.dismiss();
                    }
                } else {
                    Log.e("API Error", "Response failed: " + response.message());
                    Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
                    progressDialog.dismiss();
                }
            }

            @Override
            public void onFailure(Call<ResponseClasses.ImageResponse> call, Throwable t) {
                Log.e("API Error Fail", "Request failed: " + t.getMessage());
                Toast.makeText(context, "Network error", Toast.LENGTH_SHORT).show();
                progressDialog.dismiss();
            }
        });
    }


}
