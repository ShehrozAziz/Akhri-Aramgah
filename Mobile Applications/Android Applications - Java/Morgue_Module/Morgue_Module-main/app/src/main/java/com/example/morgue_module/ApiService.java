package com.example.morgue_module;
import java.util.Map;

import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ApiService {
    @POST("/api/loginMorgue")
    Call<ResponseClasses.LoginResponse> login(@Body RequestClasses.FetchMorgue fetch);

    @POST("/api/releaseCabin")
    Call<ResponseClasses.ReleaseResponse> release(@Body RequestClasses.ClearCabin clearCabin);
    @POST("/upload")
    Call<ResponseClasses.ReleaseResponse> upload(@Body RequestClasses.SendBody body);
    @POST("/delete")
    Call<ResponseClasses.ReleaseResponse> delete(@Body RequestClasses.DeleteBody body);
    @GET("images")
    Call<ResponseClasses.ImageResponse> getImages(@Query("morgueID") String morgueID);
    @GET("/services")
    Call<Map<String, String>> getServices();



}
