import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { execSync } from "child_process";

/**
 * An action class that toggles the mute status in Zoom.
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
   */
  private toggleZoomMute(): void {
    const script = `osascript -e 'tell application "zoom.us"
      tell application "System Events"
        keystroke "a" using {shift down, command down}
      end tell
    end tell'`;

    execSync(script);
  }

  /**
   * Get the current mute status of Zoom
   * Returns true if muted, false if unmuted
   */
  private getZoomMuteStatus(): boolean {
    // Execute AppleScript to check Zoom mute status
    const script = `osascript -e '
      set muteStatus to "muted"
      tell application "System Events"
        if exists (process "zoom.us") then
          tell application process "zoom.us"
            if exists (menu item "Mute audio" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set muteStatus to "unmuted"
            else if exists (menu item "Unmute audio" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set muteStatus to "muted"
            end if
          end tell
        end if
      end tell
      return muteStatus
    '`;

    try {
      const result = execSync(script).toString().trim();
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
