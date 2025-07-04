package com.example.gorkan_module;

public class Parser {
    public static class MaintenanceRequests{
        private String GraveID;
        private String GraveyardID;
        public MaintenanceRequests(String GraveID,String GraveyardID)
        {
            this.GraveID = GraveID;
            this.GraveyardID = GraveyardID;
        }

        public String getGraveID() {
                return GraveID;
        }

        public String getGraveyardID() {
            return GraveyardID;
        }

        public void setGraveID(String graveID) {
            GraveID = graveID;
        }

        public void setGraveyardID(String graveyardID) {
            GraveyardID = graveyardID;
        }
    }
    public static class GraveOrder{
        private String GraveID;
        private String GraveyardID;
        private String status;
        public GraveOrder(String GraveID,String GraveyardID)
        {
            this.GraveID = GraveID;
            this.GraveyardID = GraveyardID;
            status = "Booked";
        }

        public String getGraveID() {
            return GraveID;
        }

        public String getStatus() {
            return status;
        }

        public void setGraveyardID(String graveyardID) {
            GraveyardID = graveyardID;
        }

        public String getGraveyardID() {
            return GraveyardID;
        }

        public void setGraveID(String graveID) {
            GraveID = graveID;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

}
