package com.example.gorkan_module;
import com.google.gson.annotations.SerializedName;
import java.util.Map;

public class Graveyard {
    @SerializedName("customID")
    private String customID;

    @SerializedName("description")
    private String description;

    @SerializedName("gorkanName")
    private String gorkanName;

    @SerializedName("graveyardId")
    private String graveyardId;

    @SerializedName("name")
    private String name;

    @SerializedName("password")
    private String password;


    @SerializedName("totalCols")
    private int totalCols;

    @SerializedName("totalGraves")
    private int totalGraves;

    @SerializedName("totalRows")
    private int totalRows;

    // Getters and Setters
    public String getCustomID() {
        return customID;
    }

    public void setCustomID(String customID) {
        this.customID = customID;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGorkanName() {
        return gorkanName;
    }

    public void setGorkanName(String gorkanName) {
        this.gorkanName = gorkanName;
    }

    public String getGraveyardId() {
        return graveyardId;
    }

    public void setGraveyardId(String graveyardId) {
        this.graveyardId = graveyardId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getTotalCols() {
        return totalCols;
    }

    public void setTotalCols(int totalCols) {
        this.totalCols = totalCols;
    }

    public int getTotalGraves() {
        return totalGraves;
    }

    public void setTotalGraves(int totalGraves) {
        this.totalGraves = totalGraves;
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    // Inner class for sourcePin
    public static class SourcePin {
        @SerializedName("lat")
        private double lat;

        @SerializedName("lng")
        private double lng;

        public double getLat() {
            return lat;
        }

        public void setLat(double lat) {
            this.lat = lat;
        }

        public double getLng() {
            return lng;
        }

        public void setLng(double lng) {
            this.lng = lng;
        }
    }
}
