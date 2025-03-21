# Email Refactor

A modern desktop application for refactoring and improving email content using AI. Built with Tauri, React, and OpenAI's GPT-4.

## Features

- Content Style & Formatting customization
- Purpose & Intent specification
- Formality & Professionalism control
- Personalization options
- Emotion & Sentiment adjustment
- Real-time email refactoring
- Dark mode support
- Modern, responsive UI

## Installation

### Prerequisites

- Node.js 16 or later
- Rust (latest stable version)
- Platform-specific build dependencies:
  - Windows: Microsoft Visual Studio C++ Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: `build-essential` package

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/emailrefactor.git
cd emailrefactor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run tauri dev
```

### Building for Production

To create a production build:

```bash
npm run tauri build
```

The packaged applications will be available in `src-tauri/target/release/bundle/`.

## Usage

1. Launch the application
2. Configure your desired email style options using the sidebar controls
3. Enter your email text in the input panel
4. Click "Refactor Email" to generate the improved version
5. Use the "Copy" button to copy the refactored email to your clipboard

## System Requirements

- Windows 10/11 (64-bit)
- macOS 10.15 or later
- Linux (with WebKit2GTK installed)

## License

MIT License

## Support

For issues and feature requests, please create an issue in the GitHub repository.
