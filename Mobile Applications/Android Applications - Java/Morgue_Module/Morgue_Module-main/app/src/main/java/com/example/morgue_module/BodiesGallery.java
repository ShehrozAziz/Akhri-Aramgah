package com.example.morgue_module;

import android.content.Context;
import android.os.Bundle;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Adapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

public class BodiesGallery extends Fragment {

    private RecyclerView recyclerView;
    private ImageAdapter adapter;
    private List<ImageData> imageList = new ArrayList<>(); // Your Base64 image list
    private TextView noImageText;

    private Context context;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate( savedInstanceState );

    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view =  inflater.inflate( R.layout.fragment_bodies_gallery, container, false );
        context = view.getContext();
        noImageText = view.findViewById( R.id.noImagesText );
        recyclerView = view.findViewById( R.id.recyclerView );
        imageList = MainActivity.imageData;
        updateUI();

        BodiesFragment.hidden.addTextChangedListener( new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if(s.toString().equals( "Call"))
                {
                    imageList = MainActivity.imageData;
                    Log.d("Recycler View","Inflating Recyecler View");
                    updateUI();
                    BodiesFragment.hidden.setText("still");
                }

            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        } );


        return view;
    }
    private void updateUI() {
        if (imageList.isEmpty()) {
            noImageText.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
        } else {
            noImageText.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
            recyclerView.setLayoutManager(new GridLayoutManager(context, 3));
            adapter = new ImageAdapter(context,MainActivity.imageData);
            recyclerView.setAdapter(adapter);
        }
    }
}