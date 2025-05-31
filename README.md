
---

# Clippy AI Helper Chrome Extension

**Version: 2.7**

Bring back the iconic Microsoft Clippy to your browser! Now powered by **Azure's Phi-4 AI model**, Clippy will pop up on most webpages to give you unique, often useless, but always amusing tips. Expect classic Clippy animations and speech bubbles to bring this friendly paperclip to life!

## Installation & Setup

Ready to bring Clippy to your browser? Here's how to get started:

1.  **Download the Extension:**
    * **Clone the Repository:** If you're familiar with Git, clone your project:
        ```bash
        git clone https://github.com/CrisSTEM/clippy-plugin.git
        cd clippy-plugin
        ```
    * **Download ZIP:** Alternatively, download the project as a ZIP file and extract it to a convenient location on your computer.

2.  **Set up Your Proxy Server (Crucial for AI Tips!):**
    This step ensures Clippy can talk to the AI securely. You'll need a server (like a virtual machine) with Node.js and npm installed.

    * **Navigate to the Proxy:** Go into the `clippy-proxy` directory on your server.
    * **Install Dependencies:** Run `npm install`.
    * **Secure Your AI Key:** Set your Azure API Key as an environment variable named `AZURE_API_KEY`.
        ```bash
        export AZURE_API_KEY="YOUR_ACTUAL_AZURE_PHI4_API_KEY"
        # For a permanent setup, add this line to your server's ~/.bashrc or ~/.profile file.
        ```
    * **Configure a Web Server (e.g., Caddy):** Set up Caddy (or your preferred web server) to forward requests from a public URL (e.g., `https://clippy-ai.yosirespondo.com/api/get-clippy-tip`) to your Node.js proxy running on `localhost:4002`.
        * **Caddyfile Example:**
            ```caddy
            clippy-ai.yosirespondo.com {
                reverse_proxy localhost:4002
            }
            ```
    * **Start the Proxy:** Use PM2 (recommended for reliable operation) or `node server.js` to run your proxy server.
        ```bash
        npm install -g pm2 # Install PM2 if you don't have it
        pm2 start server.js --name clippy-proxy
        pm2 save # Saves your PM2 processes
        pm2 startup # Configures PM2 to start on boot
        ```
    * **DNS:** Make sure your chosen subdomain (e.g., `clippy-ai.yosirespondo.com`) points to your server's public IP address.

3.  **Configure the Chrome Extension:**

    * Open the `clippy-plugin` folder (the one with `manifest.json`).
    * **Edit `background.js`:**
        * Update `PROXY_ENDPOINT` with your proxy's public URL:
            ```javascript
            const PROXY_ENDPOINT = "https://clippy-ai.yosirespondo.com/api/get-clippy-tip"; // YOUR PROXY URL HERE
            const AZURE_MODEL_NAME = "Phi-4"; // Keep this as is
            ```
    * **Edit `manifest.json`:**
        * Add your proxy's URL to `host_permissions`:
            ```json
            "host_permissions": [
                "<all_urls>",
                "https://clippy-ai.yosirespondo.com/*" // YOUR PROXY URL HERE
            ]
            ```
    * **Important: Get Extension ID for CORS:**
        * First, load the extension unpacked in Chrome (see step 4 below).
        * Go to `chrome://extensions/` and copy the unique **ID** of your "Clippy AI Helper" extension.
        * **Crucially:** Update the `origin` in your proxy server's `server.js` file (look for `app.use(cors({ origin: 'chrome-extension://YOUR_EXTENSION_ID_HERE' }));`) with this ID.
        * After updating, restart your proxy server: `pm2 restart clippy-proxy`.

4.  **Load the Extension in Chrome:**

    * Open Chrome and type `chrome://extensions/` into the address bar, then press Enter.
    * At the top right, toggle **"Developer mode"** ON.
    * Click the **"Load unpacked"** button.
    * Browse to and select the `clippy-plugin` folder (the one containing `manifest.json`) you downloaded or cloned.

---

## Usage

Once installed and configured, Clippy will:

* **Appear automatically** on most webpages you visit, usually at the bottom right.
* **Give you tips** every 30 seconds, powered by AI, along with playful animations.
* Let you **interact** with it: click the "Ask for Tip" button for an instant new tip, "Random Animation" to see a new move, or "Hide Clippy" to make it disappear.

## Important Note on Compatibility (Trusted Types)

Clippy loves to appear everywhere, but some very secure websites (like parts of Google, including YouTube or `Googleusercontent.com` domains) use advanced security features like **'Trusted Types'** or strict **Content Security Policies (CSP)**. These features prevent the injection of external JavaScript, which means Clippy might not appear on these specific sites. This is a browser and website security measure, not an issue with the extension itself.

---