# X Auto Like

A Chrome extension that automatically likes tweets on X (Twitter) with configurable settings.

## Features

- **Two Like Modes**
  - **Hover Mode**: Likes tweets when you hover over them
  - **Auto Mode**: Automatically likes all visible tweets

- **Auto Scroll**: Hands-free scrolling at configurable speeds
- **Smart Tab Detection**: Works on "For You" and/or "Following" tabs
- **Self-Protection**: Won't like your own tweets
- **Rate Limiting**: Configurable hourly limits to stay safe
- **Debug Mode**: Enable console logging for troubleshooting

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the extension folder
6. Visit [x.com](https://x.com) and click the extension icon

## Usage

### Basic Setup

1. Click the extension icon in your browser toolbar
2. Enter your username (without @) to prevent liking your own tweets
3. Configure your settings (see below)
4. Click **Save**
5. Toggle **Enable** to start

### Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Like Mode** | Hover / Auto | How the extension likes tweets |
| **Active On** | All / Home / Following / Both | Which pages to run on |
| **Auto Scroll** | Off / Slow / Medium / Fast | Automatic page scrolling |
| **Min Delay** | 0.5 - 10 sec | Minimum time between likes |
| **Max Delay** | 1 - 30 sec | Maximum time between likes |
| **Max Likes/Hour** | 10 - 200 | Hourly rate limit |
| **Debug Mode** | On / Off | Console logging for troubleshooting |

### Like Modes Explained

**Hover Mode** (Recommended)
- Likes tweets only when you hover over them
- Gives you control over what gets liked
- More natural browsing experience

**Auto Mode**
- Automatically likes every visible tweet
- Works best with Auto Scroll enabled
- Fully hands-free operation

### Tab Detection

The extension can detect whether you're on the "For You" or "Following" tab:

- **Home Only**: Only likes on "For You" tab
- **Following Only**: Only likes on "Following" tab  
- **Home + Following**: Likes on both tabs
- **All Pages**: Likes everywhere (profiles, threads, etc.)

## Troubleshooting

### Extension not liking tweets?

1. Make sure the extension is **Enabled** (green status)
2. Check you're on an **allowed page** per your settings
3. Enable **Debug Mode** and check the browser console (F12)
4. Verify you haven't hit the **hourly limit**

### To view debug logs:

1. Enable Debug Mode in settings
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for messages starting with 🔥, ❤️, etc.

## Safety Notes

⚠️ **Use responsibly!** Excessive liking may trigger X's anti-spam measures.

Recommended safe settings:
- Max 30-60 likes per hour
- Min delay of 1-2 seconds
- Use Hover mode for more control

## File Structure

```
x-auto-like/
├── manifest.json      # Extension configuration
├── content.js         # Main logic (runs on X.com)
├── popup.html         # Settings popup UI
├── popup.css          # Popup styling
├── popup.js           # Popup logic
├── icons/             # Extension icons
└── .github/           # Issue templates
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - feel free to modify and share!

## Author

Author: [Rajiv Ranjan](https://rajivranjan.in).
