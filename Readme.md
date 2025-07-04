# 🕊️ Akhri Aramgah – End-to-End Burial & Funeral Management System

## 📌 Project Title:
**Akhri Aramgah**

---

## ❓ Problem Statement

Despite advancements in digital services worldwide, there is **no single unified platform**—locally or globally—that offers complete automation and coordination of **burial and funeral services**. In Pakistan and across the globe, grieving families face **logistical, administrative, and emotional hurdles** due to the lack of an integrated solution for managing post-death services.

From arranging a burial site to transportation, documentation, and complaint handling, each task is **fragmented, manual, and uncoordinated**.

---

## 📘 Project Description

**Akhri Aramgah** is the **first-of-its-kind** end-to-end **burial and funeral management system**, consisting of **7 interconnected applications**:

- **5 Mobile Applications** (developed using **React Native** and **Java** for Android)
- **2 Web Applications** (developed in **React.js**)
- Each with its own dedicated **backend in Node.js**
- Integrated with **email-based user verification** and **secure authentication**

---

## 📱 Application Overview

### 1. **User Mobile App** (React Native)
- Mirrors functionality of user web app
- Allows users to:
  - Register a death
  - Book burial services
  - Request transportation or catering
  - Track service status
  - Submit complaints
  - View burial locations and history

### 2. **User Web App** (React.js)
- Web portal for user functionality:
  - Burial scheduling
  - Payment management
  - Plot location on maps
  - Feedback and complaint portal

### 3. **Admin Web App** (React.js)
- Central admin dashboard:
  - Approve/reject requests
  - Assign gorkan, transporter, caterer
  - Monitor complaints & services
  - Manage users, staff, and inventory

### 4. **Stakeholder Android App** (Java)
- Role-based operational app for field personnel:
  - **Morgue Manager** – Body handling & preservation
  - **Gorkan** – Grave assignment & burial tracking
  - **Transporter** – Hearse & logistics
  - **Caterer** – Food service management

---

## 🔍 Specialized Modules

### 📸 **Shanakht Gar (Facial Recognition System)**
- AI-based facial recognition
- Identifies **unclaimed bodies**
- Matches with missing person database
- Supports law enforcement and morgues

### 🧠 **Shikayat Nazim (NLP Complaint Handler)**
- NLP-powered complaint analyzer
- Automatically **categorizes**, **prioritizes**, and **escalates** user issues
- Boosts efficiency & response time

### 🌱 **Nigran (IoT Soil Moisture Monitoring)**
- Monitors **graveyard soil moisture** using IoT sensors
- Detects risks like improper burial or collapse
- Sends alerts for timely irrigation or maintenance

---

## ✅ Conclusion

**Akhri Aramgah** is a **modular, scalable**, and **first-mover** platform in **funeral tech**.

It blends modern tech:
- 🟦 **React.js**
- 🟩 **Node.js**
- ⚫ **Android (Java)**
- 🟨 **React Native**
- 🤖 **Facial Recognition**
- 🧠 **NLP**
- 🌐 **IoT**

By bringing **automation**, **transparency**, and **dignity** into managing post-death services, Akhri Aramgah addresses a highly sensitive and critical societal need.

> ⚙️ Built with compassion. Powered by code.

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
