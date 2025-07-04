package com.example.morgue_module;
import com.google.gson.annotations.SerializedName;

public class ImageData {
    @SerializedName("body_id")
    private String bodyId;

    @SerializedName("image_base64")
    private String imageBase64;

    public String getBodyId() {
        return bodyId;
    }

    public String getImageBase64() {
        return imageBase64;
    }
}

