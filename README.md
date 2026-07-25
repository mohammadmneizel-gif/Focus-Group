# Online Focus Group Platform

## 📖 Project Overview
The Online Focus Group Platform is a secure, premium, and highly interactive web application designed to share confidential scripts (PDFs) with invited participants and collect detailed feedback. 

Built with a "mobile-first" approach and a luxurious cinematic UI (dark mode with gold accents), the platform features a seamless bilingual interface (Arabic & English)[cite: 7], auto-saving capabilities[cite: 11, 14], a custom 3D flipbook reader[cite: 10, 11], and a serverless backend powered by Google Apps Script[cite: 12].

## 🏗️ Core Architecture
This project is built using a **Decoupled Architecture**:
*   **Frontend (Client-Side):** Pure HTML5, CSS3, and Vanilla JavaScript. No heavy frontend frameworks (like React or Vue) are used, ensuring lightning-fast load times. State management between pages is handled securely using the browser's `sessionStorage`[cite: 11, 13, 14, 15, 16].
*   **Backend (Server-Side):** A serverless architecture utilizing a **Google Apps Script (GAS) Web App**[cite: 12]. The frontend communicates with a single Google Drive / Google Sheets ecosystem via asynchronous `fetch` API requests handled exclusively by the `api.js` file[cite: 12].
*   **Third-Party Libraries:** The only external library used is **PDF.js** (loaded via CDN) to render secure, un-downloadable script images inside the custom reader[cite: 6, 11].

## 📂 Folder Structure
To keep the project modular and maintainable, the files are organized into a strict hierarchy. Here is the complete map of the project:

```text
/
├── index.html          # Step 1: Entry / Login Page
├── nda.html            # Step 2: Non-Disclosure Agreement
├── library.html        # Step 3: Script Selection Library
├── reader.html         # Step 4: Secure PDF Flipbook Reader
├── feedback.html       # Step 5: Detailed Feedback Form
├── README.md           # Master Documentation (This file)
│
└── assets/             # All static resources
    ├── css/
    │   ├── style.css   # Global design system (colors, fonts, base components)
    │   ├── forms.css   # Layouts for inputs, checkboxes, and rating panels
    │   ├── library.css # Grid and card styling for the script library
    │   └── reader.css  # 3D flipbook animations, toolbars, and zooming
    │
    ├── js/
    │   ├── api.js      # The single bridge handling all Google Apps Script communication
    │   ├── entry.js    # Logic for index.html (Validation, Auth)
    │   ├── nda.js      # Logic for nda.html (Checkbox guards, Timestamps)
    │   ├── library.js  # Logic for library.html (Fetching active scripts)
    │   ├── reader.js   # Logic for reader.html (PDF rendering, navigation, auto-save)
    │   └── feedback.js # Logic for feedback.html (Form validation, draft saving, submission)
    │
    └── images/         # (Background images)
        ├── index-bg.png
        ├── nda-bg.png
        ├── library-bg.png
        ├── reader-bg.png
        └── feedback-bg.png
```

## 🔄 The User Journey Flow
The platform is strictly linear. Users cannot skip steps. The JavaScript logic actively monitors `sessionStorage` on every page load to ensure the participant is supposed to be there[cite: 11, 14, 15, 16]. 
1. **Authentication:** User enters Name and Phone Number -> Validated against backend[cite: 13].
2. **Security:** User reads and accepts the NDA -> Timestamp is recorded[cite: 16].
3. **Selection:** User views assigned scripts -> Selects one to read[cite: 15].
4. **Consumption:** User reads script in the flipbook -> Can zoom, swipe, and take notes[cite: 11].
5. **Feedback:** User fills out detailed ratings and open-ended questions -> Submits to backend[cite: 14].



## 🛡️ Security & Routing (The "Guard" System)
Because this platform uses a decoupled frontend, there is no traditional server to redirect users if they try to skip a step (e.g., trying to open the reader without signing the NDA). 

To solve this, a strict **Guard System** is implemented at the very top of every JavaScript file. 
*   The system relies on the browser's `sessionStorage`[cite: 11, 14, 15, 16]. 
*   When a user completes a step (like logging in), specific keys (like `ofg_fullName` and `ofg_sessionToken`) are saved to the browser[cite: 13, 16].
*   If a user tries to access a page out of order, the JavaScript instantly checks for these keys[cite: 11, 14, 15, 16]. 
*   If they are missing, the script halts execution and violently redirects the user back to the correct step[cite: 11, 14, 15, 16].

## 📄 HTML Pages Breakdown

The frontend is composed of five distinct HTML pages. Every page includes a language toggle button allowing real-time switching between Arabic (RTL) and English (LTR)[cite: 2, 3, 4, 5, 6].

### 1. `index.html` (The Entry Gate)
This is the landing page where invited participants log in[cite: 3].
*   **Purpose:** To capture the user's Full Name and Phone Number and initiate the backend authentication process[cite: 3].
*   **Key Elements:** 
    *   A custom golden group SVG icon[cite: 3].
    *   HTML5 form with native and custom validation for name and phone inputs[cite: 3].
    *   A confidential footer warning indicating the system is for invited users only[cite: 3].

### 2. `nda.html` (The Legal Barrier)
This page acts as a mandatory legal checkpoint[cite: 5].
*   **Purpose:** To ensure the user legally agrees to keep the proprietary scripts confidential before viewing any library contents[cite: 5].
*   **Key Elements:**
    *   A custom scrollable `.nda-box` containing the legal terms[cite: 5].
    *   A large, interactive checkbox (`#ndaCheckbox`)[cite: 5].
    *   The primary action button (`#continueBtn`) remains strictly disabled until the checkbox is checked[cite: 5].

### 3. `library.html` (The Script Selection)
The central hub for participants after authentication[cite: 4].
*   **Purpose:** To display a dynamic grid of available scripts fetched directly from the Google Apps Script backend[cite: 4].
*   **Key Elements:**
    *   An empty `.script-grid` container (`#scriptGrid`) waiting for JavaScript injection[cite: 4].
    *   A hidden `#emptyState` message that only appears if the backend returns zero available scripts (or an error)[cite: 4].

### 4. `reader.html` (The Cinematic Flipbook)
The most complex UI in the platform, designed to emulate a real reading experience[cite: 6].
*   **Purpose:** To render the confidential PDF scripts securely without allowing the user to download the actual file[cite: 6].
*   **Key Elements:**
    *   **PDF.js Integration:** Loads the PDF.js library via a CDN at the bottom of the page[cite: 6].
    *   **Viewport & Navigation:** A `.book-viewport` holding previous/next navigation arrows and floating cinematic zoom controls (`#zoomInBtn`, `#zoomOutBtn`)[cite: 6].
    *   **Security:** A `#watermark` container designed to overlay the participant's name repeatedly across the script to deter screenshots[cite: 6].
    *   **Productivity:** A fully responsive `.page-notes` container. On desktop, the text box remains open for easy typing. On mobile, it collapses into a native button to save screen real-estate. The placeholder text dynamically shifts between English and Arabic based on the active language setting.
    *   **Footer:** A visual progress bar (`#progressFill`) and page indicator (`#pageIndicator`)[cite: 6].

### 5. `feedback.html` (The Evaluation Form)
The final step of the user journey[cite: 2].
*   **Purpose:** To collect detailed, granular ratings and open-ended feedback regarding the script they just read[cite: 2].
*   **Key Elements:**
    *   Top action buttons allowing the user to return to the script or the library[cite: 2].
    *   A responsive grid (`.slider-grid`) containing 10 specific rating metrics (Story, Dialogue, Pacing, etc.)[cite: 2].
    *   Hidden dropdown selects that are overridden by the custom JavaScript glass-morphic tap blocks[cite: 2].
    *   Multiple textareas for open-ended questions (Favorite moment, suggestions, etc.)[cite: 2].
    *   A hidden `#pageNotesSummary` block that automatically compiles the notes taken during the reading phase[cite: 2].
    *   A hidden `#thankYou` screen that replaces the form upon successful backend submission[cite: 2].


## 🎨 Design System & CSS Architecture

The platform utilizes a custom "Cinematic Glass-morphism" aesthetic. Instead of relying on CSS frameworks like Bootstrap or Tailwind, the design is written in modular, vanilla CSS to maintain absolute control over the UI elements and animations.

### Global Variables & Theming (`style.css`)
This file acts as the master blueprint for the entire application's visual identity[cite: 7]. 
*   **CSS Variables:** All core colors (deep charcoal backgrounds, premium gold accents like `#d4af6a`), border radii, and shadows are stored as `:root` variables[cite: 7]. This ensures complete consistency across all pages.
*   **Dynamic Typography:** The platform loads Google Fonts (`Tajawal` for Arabic, `Poppins` for English)[cite: 7]. The CSS automatically switches the active font family based on the `<html>` tag's `lang` attribute[cite: 7].
*   **Backgrounds:** Each page assigns a unique cinematic background image via classes (e.g., `.bg-index`, `.bg-reader`), overlaid with a dark, translucent gradient to ensure text readability[cite: 7].

### Form Components (`forms.css`)
This file handles the structural styling for user inputs across the Entry, NDA, and Feedback pages[cite: 8].
*   **Glass-morphic Inputs:** Text inputs and textareas use translucent backgrounds (`rgba(0, 0, 0, 0.4)`) with subtle borders that glow gold upon focus[cite: 8].
*   **Interactive Rating Panels:** The feedback rating systems (1-5 scales) are styled as interactive, tap-able blocks inside independent `.rating-field` panels[cite: 8]. When a user selects a rating, the block illuminates with a golden linear gradient and a soft drop shadow[cite: 8].
*   **Validation States:** Form fields dynamically switch to error states (displaying red borders and revealing hidden `.field-error` text) if the user skips a mandatory question[cite: 8].

### Script Library Layout (`library.css`)
A lightweight file dedicated exclusively to the `library.html` selection screen[cite: 9].
*   **Responsive Grid:** Uses CSS Grid (`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`) to ensure script cards automatically reorganize themselves beautifully on phones, tablets, and massive desktop monitors[cite: 9].
*   **Hover Physics:** Cards feature a `transform: translateY(-4px)` lift and a golden glowing box-shadow when hovered over, signaling interactivity[cite: 9].

### The 3D Flipbook (`reader.css`)
This is the most mathematically complex stylesheet, strictly governing the reading experience[cite: 10].
*   **Viewport Lock:** The body is locked to `100vh` with `overflow: hidden` to prevent the actual web page from scrolling, forcing the user to navigate exclusively within the book's constraints[cite: 10].
*   **3D Page Flipping:** Utilizes CSS `perspective`, `transform-style: preserve-3d`, and `@keyframes` animations (`rotateY`) to create the illusion of physical pages turning forward and backward[cite: 10].
*   **Cinematic Controls:** Floating zooming controls (`.zoom-controls`) and navigation buttons sit strictly layered above the document[cite: 10].
*   **Anti-Piracy Watermark:** The `.watermark` class uses `transform: rotate(-32deg)` and `pointer-events: none` to tile the participant's name diagonally across the script without obstructing their ability to click or zoom[cite: 10].


## ⚙️ JavaScript Logic & Data Flow

The platform utilizes Vanilla JavaScript to handle all interactivity, validation, state management, and API communications. There are no heavy frameworks, ensuring fast execution and broad compatibility.

### `api.js` (The Backend Bridge)
This is the most critical utility file[cite: 12]. 
*   **Centralized Fetch:** It acts as the *only* file that communicates directly with the Google Apps Script Web App[cite: 12].
*   **CORS Management:** Uses `text/plain;charset=utf-8` as the Content-Type to bypass complex CORS preflight issues common with Google Apps Script, while still sending stringified JSON payload bodies[cite: 12].
*   **Public Methods:** Exposes asynchronous functions (`registerParticipant`, `acceptNda`, `listScripts`, `getScriptContent`, `submitFeedback`) that are called by the individual page scripts[cite: 12].

### `entry.js` (Authentication)
*   **Validation:** Uses strict logic and regular expressions to ensure the user enters a valid full name (minimum two words) and a correctly formatted phone number[cite: 13].
*   **State Initiation:** Upon a successful backend response, it saves the `ofg_fullName`, `ofg_phone`, and a secure `ofg_sessionToken` into the browser's `sessionStorage`[cite: 13].

### `nda.js` (Legal Timestamping)
*   **Guard System:** Halts execution and redirects if the login session data is missing[cite: 16].
*   **Interaction:** Monitors the checkbox state in real-time to toggle the disabled state of the continue button[cite: 16].
*   **Execution:** Calls the backend to record the NDA acceptance, generates an ISO timestamp, and saves `ofg_ndaAccepted` to the session before moving the user forward[cite: 16].

### `library.js` (Dynamic Rendering)
*   **Fetching Data:** Calls `listScripts()` using the active session token to retrieve the specific PDFs assigned to the user[cite: 15].
*   **DOM Manipulation:** Iterates through the returned JSON array, dynamically constructing `.script-card` HTML elements and injecting them into the DOM grid[cite: 15].
*   **Completion Tracking:** Checks the local `ofg_completedScripts` array to visually tag scripts the user has already reviewed with a "Reviewed" badge[cite: 15].

### `reader.js` (The PDF Engine)
*   **Rendering Pipeline:** Takes the Base64 string from the backend, converts it to a binary `Uint8Array`, and feeds it to the `pdfjsLib` engine[cite: 11]. It renders the PDF at a 2x scale on hidden canvas elements, exporting high-res images for the flipbook array[cite: 11].
*   **Navigation & Auto-Save:** Controls the CSS 3D flip classes based on mouse clicks, touch swipes, or keyboard arrows. The logic actively ignores swipes if the user is zoomed in, preventing accidental page turns. Includes a custom, responsive glass-morphic modal to confirm before safely exiting the reader. Actively saves `ofg_currentPage` so users retain their exact place even if the browser crashes or refreshes.
*   **Page Notes:** Captures keystrokes in the notes textarea and saves them to an `ofg_pageNotes` JSON object, mapped precisely to the current page index[cite: 11].

### `feedback.js` (Evaluation & Submission)
*   **Auto-Save Drafts:** Attaches listeners to all textareas and interactive rating blocks, backing up keystrokes and selections to `sessionStorage` (`ofg_draft_...`, `ofg_rating_...`) to instantly restore the form's state in case of accidental browser refresh.
*   **UI Data Binding:** Intercepts clicks on the custom tap-block rating buttons, visually updates the selected state, and silently pushes the selected number into hidden `<input>` fields for native form submission[cite: 14].
*   **Data Compilation:** Gathers all numeric ratings, open text, detected device type, browser information, reading duration, and the compiled page notes into a single master payload object[cite: 14]. Sends this payload via `submitFeedback()` and purges the temporary session drafts upon success[cite: 14].


## 🔗 Google Apps Script (Backend Integration)

The entire backend operates on Google Workspace (Drive and Sheets) using a deployed Google Apps Script Web App. 

### How the Connection Works
1.  **The Endpoint:** In `assets/js/api.js`, there is a constant named `BACKEND_URL`[cite: 12]. This contains the live URL of your deployed Google Apps Script Web App[cite: 12].
2.  **The Request (Frontend):** When a user performs an action (e.g., submits feedback), `api.js` uses the native `fetch()` API to send an HTTP POST request to the `BACKEND_URL`[cite: 12]. It sends the data as a stringified JSON payload with `"Content-Type": "text/plain;charset=utf-8"` to bypass standard CORS preflight restrictions[cite: 12].
3.  **The Processing (Backend):** The Google Apps Script intercepts the POST request, parses the text body back into a JSON object, and routes it based on the `action` parameter (e.g., `registerParticipant`, `submitFeedback`)[cite: 12]. 
4.  **The Data Storage:** The Apps Script interacts directly with your Google Sheets (inserting rows for participant logins, NDA timestamps, and final feedback data) and Google Drive (fetching the Base64 binary data of the PDF scripts to send to the reader).
5.  **The Response:** The Apps Script returns a JSON object (e.g., `{ success: true }`) which `api.js` resolves and passes back to the frontend page logic to trigger the next UI step[cite: 12, 13, 14].

## 🌍 Localization & Bilingual System

The platform is built with a custom, lightweight localization engine to seamlessly support both English (LTR) and Arabic (RTL) users without requiring duplicate HTML files.

### The Mechanism
*   **HTML Attributes:** All text elements in the HTML files use custom `data-i18n` (for text content) or `data-i18n-placeholder` (for input placeholders) attributes mapping to specific keys[cite: 2, 3].
*   **JavaScript Dictionaries:** Every JS file (`entry.js`, `nda.js`, `library.js`, `feedback.js`) contains a `translations` object holding the exact text variations for both `ar` and `en`[cite: 13, 14, 15, 16].
*   **The `applyLanguage()` Function:** When the language toggle button is clicked, this function executes[cite: 13, 14, 15, 16]. It loops through all `[data-i18n]` elements on the page and injects the corresponding string from the dictionary[cite: 13, 14, 15, 16].
*   **Layout Flipping:** The function dynamically updates the `<html>` tag's `lang` attribute and sets the `dir` (direction) attribute to either `ltr` or `rtl`[cite: 13, 14, 15, 16]. The browser and the CSS automatically mirror the layout (text alignment, flexbox directions, font families) based on this direction[cite: 7].
*   **Memory:** The chosen language is saved to `sessionStorage` under the key `ofg_lang`, ensuring the user's preference persists as they navigate from page to page[cite: 13, 14, 15, 16].


## 🚀 Setup & Deployment Instructions

Because this platform uses a pure HTML/CSS/JS frontend and a serverless backend, deployment is incredibly straightforward. There are no Node.js environments, Webpack build steps, or NPM dependencies required.

### 1. Local Testing
To test the UI locally:
*   Download or clone the project folder to your computer.
*   You do not need a local server (like Apache or Node) just to view the pages. You can simply double-click `index.html` to open it in your browser.
*   *Note:* For the API calls to work properly without CORS warnings during local testing, it is highly recommended to use a lightweight local server extension like **Live Server** (for VS Code).

### 2. Connecting the Backend
Before the platform can actually authenticate users or load scripts, you must link it to your Google Apps Script:
1.  Deploy your Google Apps Script code as a **Web App**.
2.  Set the access permissions to **"Execute as: Me"** and **"Who has access: Anyone"**.
3.  Copy the Web App URL provided by Google.
4.  Open `assets/js/api.js` in your code editor.
5.  Paste the URL into the `BACKEND_URL` constant variable at the top of the file.

### 3. Production Deployment
To deploy the frontend to the public:
*   You can host this entire folder on any static web hosting service. 
*   Excellent, free options include **GitHub Pages**, **Vercel**, **Netlify**, or standard cPanel shared hosting.
*   Just upload the files, and the platform will immediately be live and communicating with your Google backend.

## 🛠️ Tech Stack Summary

*   **Markup & Styling:** HTML5, CSS3 (CSS Variables, Flexbox, CSS Grid, Glass-morphism design, 3D Transforms).
*   **Logic:** Vanilla JavaScript (ES6+, Async/Await, Fetch API, Session Storage).
*   **PDF Engine:** [PDF.js (v3.11.174)](https://mozilla.github.io/pdf.js/) via CDN.
*   **Backend:** Serverless Google Apps Script (GAS) connected to Google Sheets & Google Drive.

## 📝 Customization & Maintenance Notes

*   **Changing Colors:** To change the gold and dark cinematic theme, you do not need to hunt through hundreds of lines of CSS. Simply open `assets/css/style.css`, locate the `:root` pseudo-class at the very top, and change the `--color-accent` or `--color-bg-start` hex codes. The entire platform will update automatically.
*   **Adding Languages:** The translation dictionaries in the JavaScript files (`entry.js`, `nda.js`, etc.) are simple JSON objects. To add a third language (like French), you just add an `fr: { ... }` object to the `translations` variable and update the toggle logic to cycle through three languages instead of two.
*   **PDF.js Updates:** If you ever need to update the PDF reader version, ensure you update *both* the script tag in `reader.html` and the `workerSrc` URL at the top of `reader.js` so they match exactly.

---
*Documentation generated for the Online Focus Group Platform.*