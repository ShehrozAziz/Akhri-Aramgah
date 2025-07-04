package com.example.gorkan_module;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.view.View;
import android.widget.ImageButton;
import android.widget.Toast;

public class GraveImage {

    private String id;
    private ImageButton button;
    private Grave grave;

    private String message;
    public GraveImage(Context context, String id, String message, ImageButton button, Grave grave){
        this.button = button;
        this.grave = grave;
        this.message = message;
        this.id = id;
        button.setOnClickListener( new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText( context, GraveImage.this.message,Toast.LENGTH_LONG ).show();
            }
        } );
    }

    public void setButton(ImageButton button) {
        this.button = button;
    }

    public void setGrave(Grave grave) {
        this.grave = grave;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public Grave getGrave() {
        return grave;
    }

    public ImageButton getButton() {
        return button;
    }
    public void ChangeColor(int code)
    {
        if(code == 1 )
        {
            button.setImageTintList(ColorStateList.valueOf(Color.parseColor("#673AB7")));
            message="Grave ID " + grave.getId() + " in the Progress of Burial"; // Set the tint to #FF6F6F
        }
        else if(code == 2)
        {
            button.setImageTintList(ColorStateList.valueOf(Color.parseColor("#FF6F6F")));
            message="Grave ID " + grave.getId() + " Completed and Filled";
        }
        else
        {
            button.setImageTintList(ColorStateList.valueOf(Color.parseColor("#4CAF50")));
            message="Grave ID " + grave.getId() + " is Empty for Burial";
        }

    }
}
