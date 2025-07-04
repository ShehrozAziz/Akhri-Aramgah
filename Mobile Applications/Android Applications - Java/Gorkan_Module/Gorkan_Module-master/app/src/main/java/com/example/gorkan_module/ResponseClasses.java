package com.example.gorkan_module;
import java.util.Map;

public class ResponseClasses {
    public static class LoginResponse{
        public Boolean success;
        private String message;
        private Graveyard graveyard;
        public LoginResponse(boolean success, String message, Graveyard graveyard)
        {
            this.success = success;
            this.message = message;
            this.graveyard  = graveyard;

        }

        public boolean isSuccess() {
            return success;
        }


        public String getMessage() {
            return message;
        }

        public Graveyard getGraveyard() {
            return graveyard;
        }
    }

    public static class FetchGravesResponse {
        private boolean success;
        private String message;
        private Map<String, Grave> graves;

        // Getters
        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public Map<String, Grave> getGraves() {
            return graves;
        }
    }
    public static class CompleteResponse{
        private boolean success;
        private String message;

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

}
