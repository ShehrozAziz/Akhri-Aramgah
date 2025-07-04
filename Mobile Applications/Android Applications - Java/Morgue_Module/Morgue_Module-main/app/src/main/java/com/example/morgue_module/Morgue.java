package com.example.morgue_module;
import java.io.Serializable;

public class Morgue implements Serializable {
    private int bookedCabins;
    private String customID;
    private String description;
    private String managerName;
    private String morgueId;
    private String name;
    private Source source;
    private int totalCabins;
    private int totalCabinsinRows;

    // Constructor
    public Morgue(int bookedCabins, String customID, String description, String managerName,
                  String morgueId, String name, Source source, int totalCabins, int totalCabinsinRows) {
        this.bookedCabins = bookedCabins;
        this.customID = customID;
        this.description = description;
        this.managerName = managerName;
        this.morgueId = morgueId;
        this.name = name;
        this.source = source;
        this.totalCabins = totalCabins;
        this.totalCabinsinRows = totalCabinsinRows;
    }

    // Getters
    public int getBookedCabins() {
        return bookedCabins;
    }

    public String getCustomID() {
        return customID;
    }

    public String getDescription() {
        return description;
    }

    public String getManagerName() {
        return managerName;
    }

    public String getMorgueId() {
        return morgueId;
    }

    public String getName() {
        return name;
    }

    public Source getSource() {
        return source;
    }

    public int getTotalCabins() {
        return totalCabins;
    }

    public int getTotalCabinsinRows() {
        return totalCabinsinRows;
    }

    // Nested class for Source
    public static class Source implements Serializable {
        private double lat;
        private double lng;

        public Source(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public double getLat() {
            return lat;
        }

        public double getLng() {
            return lng;
        }
    }
}
