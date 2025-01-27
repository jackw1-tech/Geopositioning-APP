package com.example.myplugin;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONObject;
import org.json.JSONArray;

public class MyPlugin extends CordovaPlugin implements LocationListener {
    private static final String TAG = "MyPlugin";
    private LocationManager locationManager;
    private CallbackContext callbackContext;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if (action.equals("getLocation")) {
            this.callbackContext = callbackContext;
            getLocation();
            return true;
        }
        return false;
    }

    @SuppressLint("MissingPermission")
    private void getLocation() {
            try {
                locationManager = (LocationManager) cordova.getActivity().getSystemService(Context.LOCATION_SERVICE);
                if (locationManager == null) {
                    callbackContext.error("LocationManager non disponibile");
                    return;
                }

                boolean gps_abilitato = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
                boolean rete_abilitata = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);

        
                if (gps_abilitato || rete_abilitata) {
                  
                    Location location = null;
                    if (gps_abilitato) {
                        location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    }
                   
                    if (location == null && rete_abilitata) {
                        location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                    }

                    if (location != null) {
                        Log.d(TAG, "Posizione trovata");
                        
                        JSONObject result = new JSONObject();
                        result.put("latitudine", location.getLatitude());
                        result.put("longitudine", location.getLongitude());
                        result.put("accuratezza", location.getAccuracy());
                        
                        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
                        pluginResult.setKeepCallback(true);
                        callbackContext.sendPluginResult(pluginResult);
                    } else {
                        callbackContext.error("Posizione Nulla");
                    }

            
                    if (gps_abilitato) {
                        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 1, this);
                        Log.d(TAG, "GPS live attivato");
                    } else if (rete_abilitata) {
                        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000, 1, this);
                        Log.d(TAG, "Internet live attivato");
                    }
                        
                } else {
                    callbackContext.error("Nessuno dei due provider è attivo");
                }
            } catch (Exception e) {
                callbackContext.error("Errore nell'accesso al servizio di localizzazione " + e.getMessage());
            }
        }


    @Override
    public void onLocationChanged(Location location) {
        Log.d(TAG, "Nuova Posizione trovata");
        try {
            
            JSONObject result = new JSONObject();
            result.put("latitudine", location.getLatitude());
            result.put("longitudine", location.getLongitude());
            result.put("accuratezza", location.getAccuracy());

            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);

        } catch (Exception e) {
            callbackContext.error("Errore nel listener della posizione " + e.getMessage());
        }
    }

}
