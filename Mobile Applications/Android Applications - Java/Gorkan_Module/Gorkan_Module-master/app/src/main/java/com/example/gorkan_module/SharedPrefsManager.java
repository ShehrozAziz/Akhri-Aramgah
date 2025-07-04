package com.example.gorkan_module;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;

public class SharedPrefsManager {
    private static final String PREFS_NAME = "MyAppPrefs";
    private static final String KEY_GRAVEYARD = "graveyard";

    private static final String KEY_CUSTOMID = "username";
    private static final String KEY_PASSWORD = "password";

    private SharedPreferences sharedPreferences;
    private Gson gson;

    public SharedPrefsManager(Context context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
    }

    // Save Transporter object with username and password
    public void saveGorkan(Graveyard graveyard, String customID, String password) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        // Save the transporter as a JSON string
        String transporterJson = gson.toJson(graveyard);
        editor.putString(KEY_GRAVEYARD, transporterJson);
        editor.putString(KEY_CUSTOMID, customID);
        editor.putString(KEY_PASSWORD, password);
        editor.apply();
    }

    // Retrieve the Transporter object
    public Graveyard getGraveyard() {
        String transporterJson = sharedPreferences.getString(KEY_GRAVEYARD, null);
        return gson.fromJson(transporterJson, Graveyard.class);
    }
    // Retrieve username
    public String getKeyCustomID() {
        return sharedPreferences.getString(KEY_CUSTOMID, null);
    }

    // Retrieve password
    public String getPassword() {
        return sharedPreferences.getString(KEY_PASSWORD, null);
    }

    // Clear stored data
    public void clearTransporterData() {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.remove(KEY_GRAVEYARD);
        editor.remove(KEY_CUSTOMID);
        editor.remove(KEY_PASSWORD);
        editor.apply();
    }
}

