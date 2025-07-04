package com.example.gorkan_module;

public class RequestClasses {
    public static class FetchGraveyard{
            private String customID;
            private String password;

            public FetchGraveyard(String customID, String password) {
                this.customID = customID;
                this.password = password;
            }

            // Getters and setters (if needed)
    }
    public static class FetchGraves{
        private String graveyardID;
        public FetchGraves(String graveyardID)
        {
            this.graveyardID = graveyardID;
        }
    }
    public static class CompleteOrder{
        private String type;
        private String GraveID;
        private String GraveyardID;
        public CompleteOrder(String Type, String GraveID, String GraveyardID)
        {
            this.GraveID = GraveID;
            this.GraveyardID = GraveyardID;
            this.type = Type;
        }

        public void setGraveyardID(String graveyardID) {
            GraveyardID = graveyardID;
        }

        public void setGraveID(String graveID) {
            GraveID = graveID;
        }

        public void setType(String type) {
            type = type;
        }

        public String getGraveID() {
            return GraveID;
        }

        public String getGraveyardID() {
            return GraveyardID;
        }

        public String getType() {
            return type;
        }
    }
}
