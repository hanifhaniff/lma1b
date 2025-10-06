# Technical Specification: Company Asset Management Web Application

## 1. Overview

This document outlines the technical specifications for a web application designed to manage company assets, starting with laptops. The application will provide a centralized platform for tracking asset details, assignments, and conditions. The chosen technology stack ensures a modern, secure, and scalable solution.

- **Frontend Framework:** Next.js
- **UI Components:** shadcn/ui
- **Backend & Database:** Supabase
- **Authentication:** Clerk

## 2. Key Features

The application will launch with the following core features, focused on laptop management.

### 2.1. Secure User Authentication
- **Functionality:** Users (e.g., IT administrators) must log in to access and manage the asset data. All data modification actions will be protected.
- **Implementation:** Clerk will be used to handle user sign-up, sign-in, and session management. This provides a robust and secure authentication system out-of-the-box, including options for social logins or password-based accounts.

### 2.2. Asset Dashboard
- **Functionality:** The main view after logging in will be a dashboard that displays a comprehensive list of all laptops in the database.
- **Implementation:** A data table component from shadcn/ui will be used. This dashboard will include:
    - **Search:** A search bar to quickly find assets by name, user, or serial number.
    - **Sorting:** Ability to sort columns (e.g., by User, Date Received).
    - **Filtering:** Options to filter assets by `Condition` or other relevant fields.

### 2.3. CRUD (Create, Read, Update, Delete) Operations for Laptops
- **Functionality:** Full management capabilities for each laptop asset.
- **Implementation:**
    - **Create (Add New Laptop):** A form (within a modal/dialog or on a separate page) will allow users to input all required details for a new laptop, including uploading an image.
    - **Read (View Details):** Clicking on a laptop record will open a detailed view showing all its information and the uploaded image.
    - **Update (Edit Laptop):** An editing form, pre-filled with the existing data, will allow for modification of any field.
    - **Delete (Remove Laptop):** A delete button with a confirmation dialog to prevent accidental removal of asset records.

### 2.4. Image Handling
- **Functionality:** The ability to upload and display an image for each laptop.
- **Implementation:** Supabase Storage will be used to host the images. The database will only store the URL to the image file, which is efficient and standard practice. The application will handle the upload process securely.

### 2.5. Responsive & Modern User Interface
- **Functionality:** The application will be fully responsive and accessible on various screen sizes, from desktops to tablets.
- **Implementation:** Built with shadcn/ui and Tailwind CSS, ensuring a clean, modern, and consistent look and feel across the application.

## 3. Application Development Flow

The development process will follow these logical steps:

1.  **Project Initialization:**
    - Set up a new Next.js project using the App Router.
    - Initialize Tailwind CSS.
    - Set up shadcn/ui by running its `init` command.

2.  **Backend & Authentication Setup:**
    - Create a new project in Supabase.
    - Design and create the `laptops` table in the Supabase database (as per the schema below).
    - Create a Supabase Storage bucket named `laptop_images` with appropriate access policies.
    - Set up a new application in Clerk.
    - Integrate the Clerk provider into the Next.js application layout to manage authentication state globally.
    - Create the `sign-in` and `sign-up` pages using Clerk's pre-built components.
    - Protect application routes using Next.js middleware to ensure only authenticated users can access the dashboard.

3.  **UI & Component Development:**
    - Build the main application layout (e.g., header with user profile, main content area).
    - Use the shadcn/ui CLI to add necessary components: `Table`, `Dialog`, `Form`, `Input`, `Button`, `DatePicker`, etc.
    - Create the primary data table component to display the list of laptops.

4.  **Feature Implementation (CRUD Logic):**
    - **Read:** Implement the data fetching logic using the Supabase client library within a Next.js Server Component to retrieve and display all laptop records in the data table.
    - **Create/Update:**
        - Build a reusable form component for adding and editing laptop data. Use libraries like `react-hook-form` and `zod` for robust form validation.
        - Write server-side functions (Next.js Server Actions) to handle form submissions. These actions will:
            1. Validate the incoming data.
            2. If an image is uploaded, upload it to the Supabase Storage bucket.
            3. Insert or update the record in the Supabase `laptops` table with the form data and the image URL.
    - **Delete:** Implement a Server Action that takes an asset `id` and deletes the corresponding record from the Supabase table. Trigger this action from a button in the UI, protected by a confirmation dialog.

5.  **Deployment:**
    - Deploy the application to a hosting platform like Vercel, which offers seamless integration with Next.js.
    - Connect the Vercel project to the Supabase and Clerk projects using environment variables for the API keys and secrets.

## 4. Database Schema

A single table will be created in the Supabase (PostgreSQL) database to store the laptop data.

**Table Name:** `laptops`

| Column Name     | Data Type                 | Constraints & Description                                                                     |
| :-------------- | :------------------------ | :-------------------------------------------------------------------------------------------- |
| `id`            | `uuid`                    | **Primary Key.** Default: `gen_random_uuid()`. A unique identifier for each record.             |
| `created_at`    | `timestamp with time zone`| **Not Null.** Default: `now()`. Automatically records the creation time.                      |
| `name`          | `text`                    | **Not Null.** The name of the laptop (e.g., "MacBook Pro 14 M3").                               |
| `assigned_user` | `text`                    | The full name of the employee using the laptop.                                               |
| `serial_number` | `text`                    | **Unique, Not Null.** The manufacturer's serial number.                                       |
| `asset_number`  | `text`                    | **Unique.** The company's internal asset tracking number.                                      |
| `model_type`    | `text`                    | The specific model or type (e.g., "A2779", "XPS 15 9530").                                     |
| `date_received` | `date`                    | **Not Null.** The date the company received the laptop.                                        |
| `condition`     | `text`                    | The current condition. Recommended to use set values like 'New', 'Good', 'Fair', 'Damaged'.   |
| `notes`         | `text`                    | Any additional information or comments.                                                       |
| `image_url`     | `text`                    | The public URL of the laptop's image stored in Supabase Storage.                              |

---

#### SQL `CREATE TABLE` Statement

For easy setup in the Supabase SQL Editor:

```sql
CREATE TABLE public.laptops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  assigned_user TEXT,
  serial_number TEXT NOT NULL UNIQUE,
  asset_number TEXT UNIQUE,
  model_type TEXT,
  date_received DATE NOT NULL,
  condition TEXT,
  notes TEXT,
  image_url TEXT
);