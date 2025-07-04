package com.example.gorkan_module;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

public class OrdersPagerAdapter extends FragmentStateAdapter {

    public OrdersPagerAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        switch (position)
        {
            case 0:
            {
                return new ConfirmedOrdersFragment();
            }
            case 1:
            {
                return new PendingOrdersFragment();
            }
            default:
            {
                return new PendingMaintainanceOrderFragment();
            }
        }
    }


    @Override
    public int getItemCount() {
        return 3;
    }
}
