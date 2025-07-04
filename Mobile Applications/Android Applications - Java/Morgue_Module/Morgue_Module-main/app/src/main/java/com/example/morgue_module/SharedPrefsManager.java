package com.example.morgue_module;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;

public class SharedPrefsManager {
    private static final String PREFS_NAME = "MyAppPrefs";
    private static final String KEY_MORGUE = "morgue";

    private static final String KEY_CUSTOMID = "username";
    private static final String KEY_PASSWORD = "password";


    private SharedPreferences sharedPreferences;
    private Gson gson;

    public SharedPrefsManager(Context context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
    }

    // Save Transporter object with username and password
    public void saveMorgue(Morgue morgue, String customID, String password) {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        // Save the transporter as a JSON string
        String transporterJson = gson.toJson(morgue);
        editor.putString(KEY_MORGUE, transporterJson);
        editor.putString(KEY_CUSTOMID, customID);
        editor.putString(KEY_PASSWORD, password);
        editor.apply();
    }

    // Retrieve the Transporter object
    public Morgue getMorgue() {
        String transporterJson = sharedPreferences.getString(KEY_MORGUE, null);
        return gson.fromJson(transporterJson, Morgue.class);
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
        editor.remove(KEY_MORGUE);
        editor.remove(KEY_CUSTOMID);
        editor.remove(KEY_PASSWORD);
        editor.apply();
    }
}

