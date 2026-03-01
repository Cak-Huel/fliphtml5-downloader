# FlipHTML5 to PDF Downloader

A lightweight, powerful Google Chrome extension that allows you to extract image pages from FlipHTML5 books and automatically merge them into a single, high-quality PDF file.

## Features

- **Direct Extraction**: Dynamically hooks into the FlipHTML5 reader to extract original, high-resolution pages (often bypassing obfuscated `.webp` hashing).
- **Auto-Merge to PDF**: Processes all extracted images securely inside your browser using `jsPDF` and saves them directly as a single PDF.
- **Privacy First**: Operates entirely locally. No external servers or API calls are used to process your documents.
- **Bypass Protections**: Able to bypass download restrictions set by publishers by retrieving the assets natively rendered by your browser.

## Installation

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/mlintangmz2765/fliphtml5-downloader.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click on **Load unpacked** and select the directory where you cloned/extracted this repository.
5. The extension is now installed and ready to use!

## How to Use

1. Navigate to any FlipHTML5 book page (e.g., `https://online.fliphtml5.com/...`).
2. Wait for the book to load completely on the screen.
3. Click the **FlipHTML5 Downloader** icon in your Chrome extensions bar.
4. Click **"Start Processing PDF"**.
5. Wait for the extension to process the pages. Once completed, a combined PDF will automatically download to your computer.

## Requirements

- Google Chrome (or any Chromium-based browser that supports Manifest V3).
- The `jspdf.umd.min.js` library is bundled locally for offline PDF generation.

## Disclaimer

This extension is provided for educational and personal archiving purposes only. Users are solely responsible for ensuring they have the right to download and store the content they access. Do not use this tool to violate copyright laws or redistribute protected content without authorization.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 mlintangmz
