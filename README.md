# Skills

## Final Project for SW

This repository is dedicated to the final project for the Sistemas Web subject. Here, we document the project's progress, installation steps, features, and other important aspects to ensure a smooth setup and usage.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [Development Process](#development-process)
7. [Contributors](#contributors)
8. [License](#license)

---

## Project Overview

The **Skills** project is a gamified platform for collaborative and practical learning within a specific domain, particularly in electronics. The project implements a skill tree system where users can visualize skills, track progress, earn badges, and unlock achievements. Users advance through completing tasks associated with each skill, earning points that contribute to unlocking badges, with the ultimate goal of achieving the highest badge, **Jedi-Zalduna**. This README will serve as a guide to understanding, installing, and developing within the project.

---

## Requirements

Before getting started, ensure you have the following software installed:

- **Node.js** (version 14 or above)
- **npm** (Node package manager, typically installed with Node.js)
- **Git** (for version control)
- **Express** (installed via npm, used to create the server framework)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Darkness-H/skills.git
   cd skills

---

## Development Process

### 10/31/2024

**Initial Script Implementations**

Created and implemented the first versions of the following scripts in the `js/scripts/` directory:

- **`scraper.js`**  
   - Purpose: Extract skill data from an external URL and format it into JSON, including the skill ID, text and icon path.

- **`download_icons.js`**  
   - Purpose: Download skill icons from external sources, save them to `public/electronics/icons`, and handle error messages for any failed downloads.
 
### 11/05/2024

**Implementation of the Front-End section**

Created and implemented the script `main.js`, which dynamically generates a visual representation of skills using SVG hexagons. The following features were incorporated:

- Dynamic Data Loading: Fetches skill data from skills.json to create a visual skill representation.
- SVG Hexagon Creation: Renders each skill as an SVG hexagon with the skill title displayed inside, ensuring proper fitting.
- Icon Integration: Loads skill icons from the public/electronics/icons directory, aligning them with their respective hexagons.

### 11/09/2024

**Implementation of Badges and points**

Created and implemented the following files:
- **`scraper-badges.js`**
  - Purpose: Extract the badge range explanation from an external URL and format it into JSON, including the name of the badge, the minimum and maximim points needed to obtain said badge, and the name of the image.
- **`get-badge.js`**
   - Purpose: Download the bages icons from external sources, save them to `public/badges`, and handle error messages for any failed downloads.
- **`leaderboard.html`**
  - Purpose: Visualize the badges and the points needed for each badge.

### 11/14/2024

**Implementation of Skills and Tasks**

Modifications in `main.js`, `index.ejs`, and `style.css`. The following features were incorporated:

   - **Hover Effect on Skills:**
       - Enlarges hexagons and shows pencil and notebook icons.
       - Displays a yellow bar at the bottom with selected skill information.
    
Created and implemented the following files:
- **`skillNotebook.html`**
   - Purpose: Defines the structure of the notebook page for displaying a skill’s title, description, tasks, and resources. Static content is used temporarily until back-end integration is implemented.
- **`skillNotebook.js`**
   - Purpose: Manages task completion with checkboxes. Triggers a confetti animation and dynamically generates a form for evidence submission when all tasks are marked complete.   
- **`skillNotebookStyle.css`**
   - Purpose: Provides styling for the notebook page, including layout for the skill details, task list, and navigation bar.

### 11/15/2024

**Implementation of "Unverified Evidence Submissions" table and red/green circles**

Created and implemented the following files:
- **`skillNotebook.js`**
  - Purpose: Displays a confetti animation when all checkboxes are ticked. Dynamically creates an evidence table with "Approve"/"Reject" buttons, saving statuses to localStorage. Adds new evidence to the table when the "Submit" button is clicked (currently set for task0 only).
- **`redGreenCircles.js`**
   - Purpose: This script processes the data stored by the previous script. After the DOM elements are loaded, it calculates the values that should be displayed in the red and green circles.
 
### 11/16/2024

The following modifications have been made:
- **Navigation Bar:** Added to the top-right of all pages for easy section access.
- Changes in the organization of the files.

### 12/23/2024

This repository has been updated to incorporate EJS templates for dynamic page rendering. Several key improvements and new folder structures have been implemented. Below are the main changes:
- The **controllers** directory is used to organize and encapsulate the business logic of the application.
   - **`user.controller.js`:** Currently, this file contains a single function, getUsers, which fetches all existing users from the database.
- The **models:** directory contains the MongoDB schemas that define the structure of the data in the application.
   - **`user.model.js`:** In this version, only the User schema has been implemented, which defines the structure for user data in the system.
- The **routes** directory is responsible for organizing and defining the application's endpoints.
   - **`user.routes.js`:** Currently, this file only defines the route for retrieving all users.
- **views/partials:** This directory contains reusable EJS partial templates that can be included in various pages to maintain consistent UI components across the application.
   - **`messages.ejs`:** This partial template is implemented in this version. It displays different messages, such as success or error messages, to the user across various pages in the application.

Apart from the updates mentioned above, the authentication functionality has been successfully integrated into the application, allowing users to register, log in, and log out.
- EJS Templates:
   - **`login.ejs`:** Provides the login form for the user to authenticate.
   - **`register.ejs`:** Provides the registration form for new users.

 ### 12/26/2024

Implemented Authentication OAuth for Github. The following modifications have been made:
- **config/passport-config.js**:
      - Implemented the GitHub strategy for Passport.js to allow users to log in with their GitHub account.
      - Added logic to handle existing users and new user creation, including assigning default usernames and credentials.
- **public/icons/github-icon.svg**:
      - Added a GitHub icon for the login button to enhance the UI.
- **app.js**:
     - Integrated Passport middleware (passport.initialize() and passport.session()).
     - Defined routes for GitHub authentication and callback handling.
