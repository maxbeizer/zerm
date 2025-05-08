/**
 * Zoom Screen Share Action
 *
 * This action provides the ability to start/stop screen sharing in Zoom meetings.
 * It works even when Zoom isn't the active application by:
 * 1. Remembering the current application focus
 * 2. Activating Zoom
 * 3. Sending the keyboard shortcut (Shift+Command+S)
 * 4. Returning focus to the original application
 *
 * @see .github/copilot-instructions.md for development guidelines
 */
import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { execSync } from "child_process";

/**
 * Action that toggles Zoom screen sharing on or off
 * Works with or without Zoom having focus
 */
@action({ UUID: "com.max-beizer.zerm.zoom-share-screen" })
export class ZoomShareScreen extends SingletonAction<ZoomShareSettings> {
  /**
   * When the action appears, set the title based on the current sharing status
   */
  override async onWillAppear(
    ev: WillAppearEvent<ZoomShareSettings>
  ): Promise<void> {
    // Try to get current sharing status when the action first appears
    try {
      const isSharing = this.getZoomSharingStatus();
      await ev.action.setTitle(isSharing ? "Stop Share" : "Share");

      // Set state only if this is a KeyAction (not a DialAction)
      if ("setState" in ev.action) {
        await ev.action.setState(isSharing ? 1 : 0);
      }
    } catch (error) {
      console.error("Error getting Zoom sharing status:", error);
      await ev.action.setTitle("Share");
    }
  }

  /**
   * Toggle Zoom screen sharing when the button is pressed
   */
  override async onKeyDown(ev: KeyDownEvent<ZoomShareSettings>): Promise<void> {
    try {
      // Toggle screen sharing in Zoom
      this.toggleZoomScreenShare();

      // Get the updated status after toggle
      const isSharing = this.getZoomSharingStatus();

      // Update the button state and title
      if ("setState" in ev.action) {
        await ev.action.setState(isSharing ? 1 : 0);
      }
      await ev.action.setTitle(isSharing ? "Stop Share" : "Share");
    } catch (error) {
      console.error("Error toggling Zoom screen sharing:", error);
      await ev.action.setTitle("Error");
    }
  }

  /**
   * Toggle screen sharing in Zoom using AppleScript
   * This works even when Zoom is not the focused application
   */
  private toggleZoomScreenShare(): void {
    const script = `osascript -e '
      -- Store the current active application to return to it later
      set currentApp to (path to frontmost application as text)

      -- Check if Zoom is running
      tell application "System Events"
        set zoomRunning to exists (process "zoom.us")
      end tell

      if zoomRunning then
        -- Activate Zoom, toggle screen sharing, and return to previous app
        tell application "zoom.us"
          activate
          delay 0.1 -- Small delay to ensure Zoom is ready

          tell application "System Events"
            keystroke "s" using {shift down, command down}
          end tell

          -- Return to the original app
          delay 0.2 -- Small delay before switching back
          tell application currentApp
            activate
          end tell
        end tell
      else
        -- Zoom is not running
        display notification "Zoom is not running" with title "Stream Deck"
      end if
    '`;

    execSync(script);
  }

  /**
   * Get the current screen sharing status of Zoom
   * Returns true if sharing, false if not sharing
   * Works without changing application focus
   */
  private getZoomSharingStatus(): boolean {
    // Execute AppleScript to check Zoom sharing status without changing focus
    const script = `osascript -e '
      set sharingStatus to "unknown"

      tell application "System Events"
        -- Check if Zoom is running
        if not (exists (process "zoom.us")) then
          return "not_running"
        end if

        -- Check Zoom meeting status via menu bar items without changing focus
        tell process "zoom.us"
          -- Check if we are in a meeting (presence of Meeting menu item)
          if (exists menu bar item "Meeting" of menu bar 1) then
            -- Check sharing status by checking which menu item exists
            if (exists menu item "Start Share" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set sharingStatus to "not_sharing"
            else if (exists menu item "Stop Share" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set sharingStatus to "sharing"
            end if
          else
            -- Not in a meeting
            return "not_in_meeting"
          end if
        end tell
      end tell

      return sharingStatus
    '`;

    try {
      const result = execSync(script).toString().trim();

      if (result === "not_running" || result === "not_in_meeting") {
        console.log(`Zoom status: ${result}`);
        return false; // Default to not sharing state for UI
      }

      return result === "sharing";
    } catch (error) {
      // If there's an error, assume Zoom is not running or not in a meeting
      console.error("Error checking Zoom sharing status:", error);
      return false;
    }
  }
}

/**
 * Settings for ZoomShareScreen action
 */
type ZoomShareSettings = {
  // Can be extended with additional settings if needed
};
