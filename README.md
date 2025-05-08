# Zerm - Zoom Controls for Stream Deck

A Stream Deck plugin providing convenient Zoom meeting controls directly from your Elgato Stream Deck.

## Features

- **Zoom Mute Toggle**: Toggle your Zoom audio mute status with a single button press
- **Zoom Video Toggle**: Toggle your Zoom camera/video with a single button press
- **Zoom Screen Share**: Start or stop screen sharing in Zoom meetings with a single button press
- Works even when Zoom is not the active application

## Requirements

- macOS (currently not supported on Windows)
- Stream Deck Software (minimum version 6.4)
- Zoom desktop client (with default keyboard shortcuts)
- Node.js v20+ (for development)

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `./script/build` to build and install the plugin

## Development

For developers wanting to extend or modify this plugin:

- Run `./script/run` for development with live reloading
- Check `.github/copilot-instructions.md` for detailed developer guidance

## How It Works

The plugin uses AppleScript to:

1. Remember which application is currently active
2. Briefly activate Zoom
3. Send keyboard shortcuts to control Zoom
4. Return to the original application

This provides a seamless experience, allowing you to control Zoom without switching context.

## License

MIT

## Credits

Created by Max Beizer
