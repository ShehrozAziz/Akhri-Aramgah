package com.example.gorkan_module;
import java.util.Map;

import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface ApiService {
    @POST("/api/getGraveyard")
    Call<ResponseClasses.LoginResponse> login(@Body RequestClasses.FetchGraveyard fetch);
    @POST("/api/getGraves")
    Call<ResponseClasses.FetchGravesResponse> fetchgraves(@Body RequestClasses.FetchGraves fetchGraves);
    @POST("/api/updateGraveOrMaintenance")
    Call<ResponseClasses.CompleteResponse> completeorder(@Body RequestClasses.CompleteOrder order);
    @GET("/services")
    Call<Map<String, String>> getServices();




}
