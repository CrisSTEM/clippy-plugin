
-----

# Clippy AI Helper Chrome Extension

**Version: 2.7**

Bring back the iconic Microsoft Clippy to your Browse experience, now supercharged with Azure's Phi-4 AI model\! Clippy will appear on most webpages, offering unique, often useless, yet amusing tips, complete with its signature animations and speech bubble.

This project demonstrates the integration of a classic UI element with a modern Large Language Model within the secure environment of a Chrome Manifest V3 extension, overcoming complex cross-context communication challenges.

## Features

  * **Iconic Clippy:** Looks and moves just like the original, powered by Clippy.js.
  * **AI-Powered Useless Tips:** Utilizes Azure's Phi-4 to generate creative, often absurd, and truly unhelpful advice based on your current webpage context.
  * **Dynamic Animations:** Clippy performs relevant animations suggested by the AI, bringing its personality to life. Animation keywords (e.g., `[ANIMATION:Thinking]`) are seamlessly removed from the speech bubble.
  * **Interactive Controls:** A small set of buttons allows you to hide Clippy, trigger random animations, or ask for a tip on demand.
  * **Secure API Integration:** Your Azure API Key is securely handled through a custom proxy server, ensuring it's never exposed in the client-side code.

## Installation

To install and run this extension in your Chrome browser:

1.  **Clone the Repository (or download the ZIP):**

    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd clippy-plugin
    ```

    *(Replace `YOUR_USERNAME/YOUR_REPO_NAME` with your actual GitHub repository details)*

2.  **Set up the Proxy Server:**
    *(This step is crucial for AI functionality and API key security)*

      * **Prerequisites:** Ensure you have Node.js and `npm` installed on your server/VM.
      * **Navigate:** Go into the `clippy-proxy` directory on your server/VM.
      * **Install Dependencies:** `npm install`
      * **Configure API Key:** Set your Azure API Key as an environment variable named `AZURE_API_KEY` on your server/VM.
        ```bash
        export AZURE_API_KEY="YOUR_ACTUAL_AZURE_PHI4_API_KEY"
        # For persistence, add this to your ~/.bashrc or ~/.profile
        ```
      * **Configure Caddy/Web Server:** Set up Caddy (or your preferred web server) to proxy requests from a public URL (e.g., `https://clippy-ai.yosirespondo.com/api/get-clippy-tip`) to your Node.js proxy server running on `localhost:4002`.
          * Example `Caddyfile` entry:
            ```caddy
            clippy-ai.yosirespondo.com {
                reverse_proxy localhost:4002
            }
            ```
      * **Start the Proxy Server:** Use PM2 (recommended for production) or `node server.js` to run your proxy server.
        ```bash
        npm install -g pm2 # if not installed
        pm2 start server.js --name clippy-proxy
        pm2 save
        pm2 startup # For auto-start on boot
        ```
      * **DNS Setup:** Ensure your chosen subdomain (e.g., `clippy-ai.yosirespondo.com`) points to your server's public IP address.

3.  **Configure the Chrome Extension:**

      * Open the `clippy-plugin` folder (the one containing `manifest.json`).
      * **Edit `background.js`:**
          * Update `PROXY_ENDPOINT` to your proxy's public URL:
            ```javascript
            const PROXY_ENDPOINT = "";
            // Make sure AZURE_API_KEY is an empty string here, as it's used by the proxy.
            const AZURE_API_KEY = "";
            ```
      * **Edit `manifest.json`:**
          * Add your proxy's URL to `host_permissions`:
            ```json
            "host_permissions": [
                "<all_urls>",
                ""
            ]
            ```
      * **Get Extension ID for CORS:**
          * Load the extension unpacked in Chrome (see next step).
          * Note down its unique ID from `chrome://extensions/`.
          * **Crucially:** Update the CORS `origin` in your proxy server's `server.js` file (e.g., `app.use(cors({ origin: 'chrome-extension://YOUR_EXTENSION_ID_HERE' }));`) with this ID. Then, `pm2 restart clippy-proxy` on your server.

4.  **Load the Extension in Chrome:**

      * Open Chrome and go to `chrome://extensions/`.
      * Enable "Developer mode" (usually a toggle in the top-right corner).
      * Click "Load unpacked".
      * Select the `clippy-plugin` folder (the one containing `manifest.json`).

## Usage

Once installed and configured:

  * **Clippy will appear** on most webpages you visit, positioned at the bottom right.
  * **Automatic Tips:** Every 30 seconds, Clippy will offer a new, useless AI-generated tip relevant to the page content, accompanied by a dynamic animation.
  * **Manual Interaction:**
      * Click the "Ask for Tip" button in the small control panel at the bottom right to get an instant new tip.
      * Use "Random Animation" to see Clippy perform a random move.
      * Click "Hide Clippy" to make it disappear.

## Important Note on Compatibility (Trusted Types)

This extension functions perfectly on the vast majority of websites. However, due to advanced security policies like **'Trusted Types'** or very strict **Content Security Policies (CSP)**, certain high-security websites (e.g., some Google properties like YouTube, https://www.google.com/search?q=Googleusercontent.com domains) block the direct injection of third-party JavaScript (like Clippy.js).

This is a security feature implemented by the website and browser design to prevent malicious code injection (like XSS attacks). Our extension prioritizes user safety and adheres to these browser security standards, thus **Clippy may not appear on such strictly protected sites**. This is a deliberate security measure of the website itself, not a limitation of the extension's functionality on compatible pages.

## Technical Details

  * **Chrome Manifest V3:** Built with the latest Chrome Extension manifest version for enhanced security and performance.
  * **Hybrid Injection Strategy:** Leverages `chrome.scripting.executeScript` (`world: 'MAIN'`) to directly inject Clippy.js and jQuery into the page's main JavaScript context for seamless integration.
  * **Secure Communication:** Utilizes `window.postMessage` and `chrome.runtime.sendMessage` via a `clippy_bridge.js` (content script) to safely communicate between the page's main context, the extension's isolated content script, and the background service worker.
  * **AI Integration:** Fetches "useless" tips from an Azure Phi-4 LLM, using a proxy server to keep your API key secure.
  * **Dynamic Animations:** AI-suggested animation names are parsed from the response and used with Clippy.js's animation API.

## Contributions

Feel free to explore, adapt, and improve this project\!