# GitHub Copilot Instructions for Zerm

## Project Overview

Zerm is a Stream Deck plugin designed to provide Zoom meeting controls directly from the Elgato Stream Deck. The plugin currently includes:

1. Zoom Mute Toggle - Toggle mute status in Zoom even when another application is focused
2. Zoom Video Toggle - Toggle camera/video status in Zoom even when another application is focused
3. Zoom Screen Share - Start/stop screen sharing in Zoom even when another application is focused
4. Zoom Focus - Bring the Zoom application to the foreground instantly
5. Zoom Leave Meeting - Leave the current Zoom meeting even when another application is focused

## Key Technologies

- **Stream Deck SDK**: Uses Elgato's Stream Deck SDK v2 for plugin development
- **TypeScript**: Written in TypeScript for type safety
- **AppleScript**: Used to interact with Zoom on macOS without requiring focus
- **Rollup**: For bundling the TypeScript code

## Project Structure

- **src/**: Contains the TypeScript source code

  - **plugin.ts**: Entry point that registers all actions
  - **actions/**: Contains individual action classes
    - **zoom-mute-toggle.ts**: Zoom mute control implementation
    - **zoom-video-toggle.ts**: Zoom video control implementation
    - **zoom-share-screen.ts**: Zoom screen sharing implementation
    - **zoom-focus.ts**: Zoom focus implementation
    - **zoom-leave-meeting.ts**: Zoom leave meeting implementation

- **com.max-beizer.zerm.sdPlugin/**: Contains the compiled plugin

  - **manifest.json**: Plugin configuration and metadata
  - **imgs/**: Icons and images for the plugin
  - **ui/**: HTML files for property inspectors
  - **bin/**: Compiled JavaScript output

- **script/**: Contains utility scripts
  - **build**: Builds the plugin and restarts Stream Deck
  - **convert-icons**: Converts SVG icons to PNG format
  - **run**: Starts the plugin in watch mode for development

## Development Patterns

### Action Implementation

Each action is implemented as a TypeScript class that:

1. Is decorated with the `@action` decorator specifying the UUID
2. Extends `SingletonAction<T>` with appropriate settings type
3. Overrides the `onWillAppear` method to handle initial setup
4. Overrides the `onKeyDown` method to handle button presses

### AppleScript Pattern

When interacting with Zoom:

1. Store the current active application
2. Check if Zoom is running
3. Activate Zoom if needed
4. Perform the desired action using keyboard shortcuts
5. Return to the original application

### State Management

Actions maintain their state by:

1. Checking the current status when they appear
2. Updating the state and title after each action
3. Using different images for different states

### Icon Management

The plugin follows these conventions for icons:

1. SVG files are the source of truth for all icons
2. PNG files are generated from SVGs during the build process using the `convert-icons` script
3. Each action has:
   - `icon.svg`: The main icon for the action (shown in the Stream Deck UI)
   - State-specific SVGs (e.g., `muted.svg`, `unmuted.svg`) for different button states
   - Generated PNGs: `icon.png`, `icon@2x.png`, `key_0.png`, `key_0@2x.png`, etc.
4. The conversion process uses ImageMagick and is integrated into the build script

## Coding Style Guidelines

1. Use clear method and variable names that describe their purpose
2. Add JSDoc comments to methods explaining their functionality
3. Handle errors gracefully with appropriate logging
4. Maintain consistent indentation (2 spaces)
5. Follow TypeScript best practices with proper typing

## Useful Commands

- `./script/build`: Builds and restarts the plugin (automatically converts SVGs to PNGs)
- `./script/run`: Runs the plugin in watch mode for development
- `./script/convert-icons`: Manually converts SVG icons to PNG format
- `npm run build`: Builds the plugin without restarting Stream Deck
- `npm run watch`: Watches for changes and rebuilds automatically

## Important Notes

- This plugin currently only works on macOS due to its use of AppleScript
- The plugin requires Zoom to have certain keyboard shortcuts enabled
- Actions work even when Zoom is not the active application

## Future Development Ideas

- Add Windows support using appropriate Windows APIs
- Add additional Zoom controls (leave meeting, reactions, etc.)
- Improve error handling and status detection
- Add settings to customize keyboard shortcuts
