package com.example.morgue_module;

import android.content.Context;
import android.os.Bundle;

import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridLayout;
import android.widget.ImageButton;
import android.widget.Toast;


public class MorgueFragment extends Fragment {

    GridLayout gridLayout1;
    public static int numRows = 10;
    public static int numCols = 30;
    Context context;
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
    {
        View view = inflater.inflate(R.layout.fragment_morgue, container, false);
        gridLayout1 = view.findViewById(R.id.gridLayout1);
        context = view.getContext();
        gridLayout1.setColumnCount(numCols);
        addImageButtons(numRows, numCols);
        return view;
    }
    private void addImageButtons(int rows, int cols) {
        int numberOfSets = rows / 4;
        int totalRowsWithAdditions = rows + numberOfSets;
        for (int i = 1; i < totalRowsWithAdditions + 1 ; i++) {
                for (int j = 0; j < cols; j++) {
                    ImageButton imageButton = new ImageButton(context);
                    imageButton.setImageResource(R.drawable.ic_box); // Replace with your image
                    imageButton.setBackgroundResource(android.R.color.transparent); // Transparent background
                    imageButton.setPadding(0, 0, 0, 0);
                    GridLayout.LayoutParams params = new GridLayout.LayoutParams();
                    params.width = 90;  // Set width for each button
                    params.height = ViewGroup.LayoutParams.WRAP_CONTENT; // Set height for each button
                    int additionaltop = 0;
                    int additionalend = 0;
                    params.setMargins(4, 6 + additionaltop, 4 +additionalend, 0);
                    imageButton.setLayoutParams(params);
                    // Set an onClickListener for each button
                    int finalI = i;
                    int finalJ = j;
                    imageButton.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            smallclickongrave();
                        }
                    });
                    imageButton.setOnLongClickListener(new View.OnLongClickListener() {
                        @Override
                        public boolean onLongClick(View v) {
                            longclickongrave(finalI*finalJ);
                            return false;
                        }
                    });
                    gridLayout1.addView(imageButton);
            }

        }
    }

    public void smallclickongrave()
    {
        Toast.makeText(context, "Long Press For Grave Info Panel", Toast.LENGTH_SHORT).show();
    }
    public void longclickongrave(int id)
    {
        Toast.makeText(context, "Long Press on Grave " + id, Toast.LENGTH_SHORT).show();
    }
}