# 🏙️ CivicHub


**CivicHub** is a comprehensive civic engagement platform designed to bridge the gap between citizens and local authorities. It facilitates the efficient reporting, tracking, and resolution of community infrastructure issues—such as road damage, drainage failures, and sanitation hazards— a centralized platform for civic engagement.

---

## 🚀 Key Features

* **Intuitive Issue Reporting:** A streamlined interface for users to report civic issues by uploading photos via **Cloudinary**, adding descriptions, and tagging specific categories (Road, Electricity, Hygiene).
* **Interactive Geolocation (Leaflet):** Incorporates **Leaflet Maps** and **OpenStreetMap** to allow users to pinpoint exact locations without relying on paid APIs. Supports automatic geolocation detection and manual pin adjustment.
* **Secure Admin Approval Workflow:** Implements a **custom security layer** where new registrations are set to "Pending" by default. Admins must manually approve users via the database before access is granted, ensuring strict platform security.
* **Comprehensive Admin Dashboard:** A centralized panel for authorities to view all reports, filter by severity, manage user roles, and update issue statuses (e.g., moving a ticket from "Open" to "Resolved").
* **Real-Time Status Tracking:** Users can track the lifecycle of their reported issues directly from their dashboard, ensuring transparency in the resolution process.
* **Heatmap Visualization:** Utilizes **Leaflet Heatmaps** to identify high-density problem areas in the city, aiding authorities in strategic resource allocation and urban planning.
* **Secure Authentication:** Robust sign-in methods including Email/Password, **Google**, and **GitHub** via Firebase Authentication.

---


## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, Material UI (MUI), Leaflet Maps |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth (Email, Google, GitHub) |
| **Storage** | Cloudinary |
| **Deployment** | Vercel |

---
