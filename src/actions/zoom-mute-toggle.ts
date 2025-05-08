/**
 * Zoom Mute Toggle Action
 *
 * This action provides the ability to toggle the audio mute status in Zoom meetings.
 * It works even when Zoom isn't the active application by:
 * 1. Remembering the current application focus
 * 2. Activating Zoom
 * 3. Sending the keyboard shortcut (Shift+Command+A)
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
 * Action that toggles Zoom mute status on or off
 * Works with or without Zoom having focus
 */
@action({ UUID: "com.max-beizer.zerm.zoom-mute-toggle" })
export class ZoomMuteToggle extends SingletonAction<ZoomMuteSettings> {
  /**
   * When the action appears, set the title based on the current mute status
   */
  override async onWillAppear(
    ev: WillAppearEvent<ZoomMuteSettings>
  ): Promise<void> {
    // Try to get current mute status when the action first appears
    try {
      const muteStatus = this.getZoomMuteStatus();
      await ev.action.setTitle(muteStatus ? "Muted" : "Unmuted");

      // Set state only if this is a KeyAction (not a DialAction)
      if ("setState" in ev.action) {
        await ev.action.setState(muteStatus ? 0 : 1);
      }
    } catch (error) {
      console.error("Error getting Zoom mute status:", error);
      await ev.action.setTitle("Zoom?");
    }
  }

  /**
   * Toggle Zoom mute state when the button is pressed
   */
  override async onKeyDown(ev: KeyDownEvent<ZoomMuteSettings>): Promise<void> {
    try {
      // Toggle mute in Zoom
      this.toggleZoomMute();

      // Get the updated status after toggle
      const isMuted = this.getZoomMuteStatus();

      // Update the button state and title
      if ("setState" in ev.action) {
        await ev.action.setState(isMuted ? 0 : 1);
      }
      await ev.action.setTitle(isMuted ? "Muted" : "Unmuted");
    } catch (error) {
      console.error("Error toggling Zoom mute:", error);
      await ev.action.setTitle("Error");
    }
  }

  /**
   * Toggle mute status in Zoom using AppleScript
   * This works even when Zoom is not the focused application
   */
  private toggleZoomMute(): void {
    const script = `osascript -e '
      -- Store the current active application to return to it later
      set currentApp to (path to frontmost application as text)

      -- Check if Zoom is running
      tell application "System Events"
        set zoomRunning to exists (process "zoom.us")
      end tell

      if zoomRunning then
        -- Activate Zoom, toggle mute, and return to previous app
        tell application "zoom.us"
          activate
          delay 0.1 -- Small delay to ensure Zoom is ready

          tell application "System Events"
            keystroke "a" using {shift down, command down}
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
   * Get the current mute status of Zoom
   * Returns true if muted, false if unmuted
   * Works without changing application focus
   */
  private getZoomMuteStatus(): boolean {
    // Execute AppleScript to check Zoom mute status without changing focus
    const script = `osascript -e '
      set muteStatus to "unknown"

      tell application "System Events"
        -- Check if Zoom is running
        if not (exists (process "zoom.us")) then
          return "not_running"
        end if

        -- Check Zoom meeting status via menu bar items without changing focus
        tell process "zoom.us"
          -- Check if we are in a meeting (presence of Meeting menu item)
          if (exists menu bar item "Meeting" of menu bar 1) then
            -- Check mute status by checking which menu item exists
            if (exists menu item "Mute audio" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set muteStatus to "unmuted"
            else if (exists menu item "Unmute audio" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set muteStatus to "muted"
            end if
          else
            -- Not in a meeting
            return "not_in_meeting"
          end if
        end tell
      end tell

      return muteStatus
    '`;

    try {
      const result = execSync(script).toString().trim();

      if (result === "not_running" || result === "not_in_meeting") {
        console.log(`Zoom status: ${result}`);
        return false; // Default to unmuted state for UI
      }

      return result === "muted";
    } catch (error) {
      // If there's an error, assume Zoom is not running or not in a meeting
      console.error("Error checking Zoom mute status:", error);
      return false;
    }
  }
}

/**
 * Settings for ZoomMuteToggle action
 */
type ZoomMuteSettings = {
  // Can be extended with additional settings if needed
};
