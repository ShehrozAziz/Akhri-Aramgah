package com.example.morgue_module;

import android.graphics.Rect;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.EditText;
import android.widget.TextView;

import androidx.fragment.app.Fragment;

import com.google.android.material.card.MaterialCardView;

public class ProfileFragment extends Fragment {

    private MaterialCardView ivGorkanImage;
    private TextView tvName, tvLocation, tvShift, tvPhone, tvEmail;
    private EditText etPhoneNumber, etPassword;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        // Initialize the views
        ivGorkanImage = view.findViewById(R.id.ivGorkanImage);
        tvName = view.findViewById(R.id.tvName);
        tvLocation = view.findViewById(R.id.tvLocation);
        tvShift = view.findViewById(R.id.tvShift);
        tvPhone = view.findViewById(R.id.tvPhone);
        tvEmail = view.findViewById(R.id.tvEmail);
        etPhoneNumber = view.findViewById(R.id.etPhone);
        etPassword = view.findViewById(R.id.etPassword);

        // Listen for layout changes to detect when the keyboard opens or closes
        view.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                Rect r = new Rect();
                view.getWindowVisibleDisplayFrame(r);
                int screenHeight = view.getRootView().getHeight();
                int keypadHeight = screenHeight - r.bottom;

                if (keypadHeight > screenHeight * 0.15) {
                    // Keyboard is opened, hide ImageView and TextViews
                    ivGorkanImage.setVisibility(View.GONE);
                    tvName.setVisibility(View.GONE);
                    tvLocation.setVisibility(View.GONE);
                    tvShift.setVisibility(View.GONE);
                    tvPhone.setVisibility(View.GONE);
                    tvEmail.setVisibility(View.GONE);
                } else {
                    // Keyboard is closed, show ImageView and TextViews
                    ivGorkanImage.setVisibility(View.VISIBLE);
                    tvName.setVisibility(View.VISIBLE);
                    tvLocation.setVisibility(View.VISIBLE);
                    tvShift.setVisibility(View.VISIBLE);
                    tvPhone.setVisibility(View.VISIBLE);
                    tvEmail.setVisibility(View.VISIBLE);
                }
            }
        });

        return view;
    }
}
