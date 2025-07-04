package com.example.morgue_module;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class ResponseClasses {
    public static class LoginResponse{
        public Boolean success;
        private String message;
        private Morgue morgue;
        public LoginResponse(boolean success, String message, Morgue morgue)
        {
            this.success = success;
            this.message = message;
            this.morgue  = morgue;

        }

        public boolean isSuccess() {
            return success;
        }


        public String getMessage() {
            return message;
        }

        public Morgue getMorgue() {
            return morgue;
        }
    }
    public static class ReleaseResponse{
        public Boolean success;
        private String message;
        public ReleaseResponse(boolean success, String message)
        {
            this.success = success;
            this.message = message;

        }

        public boolean isSuccess() {
            return success;
        }


        public String getMessage() {
            return message;
        }

    }
    public class ImageResponse {
        @SerializedName("success")
        private boolean success;

        @SerializedName("message")
        private String message;

        @SerializedName("images")
        private List<ImageData> images;

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public List<ImageData> getImages() {
            return images != null ? images : new java.util.ArrayList<>();  // Ensure a valid list is always returned
        }
    }

}
