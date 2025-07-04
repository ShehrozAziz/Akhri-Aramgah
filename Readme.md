Final Year Project - Application Suite
======================================

This project consists of a complete system of mobile, web, and backend applications developed for the Final Year Project (FYP). It includes:

- 4 Android Applications in Java (in Mobile Applications -> Android Applications - Java)
- 1 React Native Application in JavaScript (in Mobile Applications -> React Native Application)
- 2 Web Frontend Applications in React (in Frontend Applications folder)
- 7 Node.js Backend Applications (in Backend Applications folder, named Node <app_name>)
- 3 Flask Backend Applications (in Backend Applications folder, named Flask <app_name>)

--------------------------------------------------

Setup Instructions (Important)
------------------------------

1. Run "Send.py" before anything else. It registers your current local IP to the deployed server so that mobile apps can connect to backends.

2. Run "On.py" after Send.py. It automatically starts all backend servers and frontend applications.
   Make sure all folder paths in On.py are set correctly based on your folder structure.

--------------------------------------------------

How to Run Each Application
---------------------------

Android Applications (Java):
- Location: Mobile Applications/Android Applications - Java/
- Open the desired app folder in Android Studio.
- First run Send.py and then On.py.
- To run:
  - On Emulator: Click "Run" in Android Studio with emulator running.
  - On Device: Enable USB debugging, connect your phone, and select it from the device list.

React Native Application (JavaScript):
- Location: Mobile Applications/React Native Application/
- Prerequisites: Node.js, React Native CLI, Android Studio
- Steps:
  1. Open terminal in the app folder.
  2. Run:
     npm install
     npx react-native start
     npx react-native run-android
  3. Make sure emulator or physical device is connected.

Frontend Web Applications (React):
- Location: Frontend Applications/
- For each frontend app:
  1. Open terminal in the app folder.
  2. Run:
     npm install
     npm start
  3. Or simply run On.py to start both frontend apps together.

Node.js Backend Applications:
- Location: Backend Applications/
- Each app is named as "Node <app_name>".
- To run individually:
  1. Open terminal in the app folder.
  2. Run:
     npm install
     node index.js

Flask Backend Applications:
- Location: Backend Applications/
- Each app is named as "Flask <app_name>".
- To run individually:
  1. Open terminal in the app folder.
  2. Run:
     pip install -r requirements.txt
     python app.py

--------------------------------------------------

Important Notes
---------------

- Always start with Send.py to ensure mobile apps know the correct IP address to connect.
- On.py is a centralized script to start all backend and frontend servers.
- Check for port conflicts and make sure all dependencies are installed properly.
- If using physical devices, ensure proper USB permissions and debugging are enabled.
- For best results, keep all folders in their intended locations.

--------------------------------------------------

Need Help?
----------
Check terminal logs for errors, confirm folder paths in On.py, and make sure all devices/emulators are properly set up.
