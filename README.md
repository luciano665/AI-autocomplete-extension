# AutoTab: AI-Powered Chrome Extension for Seamless Text Completions

AutoTab is an advanced Chrome extension that enhances your typing experience with real-time AI-powered text completions. Designed for efficiency, it seamlessly integrates with any text input field on the web, offering smart suggestions that can be accepted instantly with a single Tab key press.

## ✨ Features

- 🚀 **Universal Compatibility** – Works across multiple websites and in any text input field.
- 🧠 **AI-Powered Suggestions** – Provides intelligent text completions in real time.
- ⌨️ **Effortless Acceptance** – Accept completions really fast using the Tab key.
- 🔗 **Seamless Integration** – Enhances existing text fields without disrupting workflow.
- 📝 **Supports Various Input Types** – Works with both standard input fields and `contenteditable` elements.
- ⚡ **Optimized Performance** – Intelligent debouncing minimizes API calls for efficiency.

## 🛠 Installation Guide

1. **Clone the repository** or download the source code:
   ```sh
   git clone https://github.com/your-repo/auto-tab-extension.git
   cd auto-tab-extension
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Build the extension:**
   ```sh
   npm run build
   ```
   This creates a `dist` folder containing the production-ready extension.
4. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the `dist` folder
5. **Pin the extension** to your browser toolbar for quick access.

## 🚀 How to Use

1. Open any website with a text input field.
2. Start typing in an input field or text area.
3. AI-generated suggestions will appear in light gray.
4. Press the **Tab** key to accept a suggestion instantly.
5. Keep typing and enjoy seamless AI-assisted writing.

## 🔍 How It Works

AutoTab injects a content script into web pages, monitoring text input fields in real time. As you type, your input is sent to an AI-powered local API, which generates contextual completions. These suggestions are then displayed in a lightweight overlay that mimics the input field's styling, ensuring a natural and intuitive user experience.

## 👨‍💻 Development & Contribution

To contribute or customize AutoTab, follow these development commands:

- **Install dependencies:**
  ```sh
  npm install
  ```
- **Build the extension:**
  ```sh
  npm run build
  ```
- **Format the code (Prettier):**
  ```sh
  npm run format
  ```

### 🛠 Customization

Modify the extension's behavior and appearance by editing the relevant JavaScript and CSS files. Tweak the styling, refine AI prompt handling, or integrate additional features to tailor AutoTab to your needs.

---

🚀 **Boost your productivity with AutoTab – the AI-powered text completion assistant for effortless writing!**
