/**
 * Zoom Leave Meeting Action
 *
 * This action provides the ability to leave the current Zoom meeting.
 * It works even when Zoom isn't the active application by:
 * 1. Remembering the current application focus
 * 2. Activating Zoom
 * 3. Sending the keyboard shortcut (Command+W)
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
 * Action that leaves the current Zoom meeting
 * Works with or without Zoom having focus
 */
@action({ UUID: "com.max-beizer.zerm.zoom-leave-meeting" })
export class ZoomLeaveMeeting extends SingletonAction<ZoomLeaveMeetingSettings> {
  /**
   * When the action appears, set the title based on the current meeting status
   */
  override async onWillAppear(
    ev: WillAppearEvent<ZoomLeaveMeetingSettings>
  ): Promise<void> {
    // Try to determine if we're in a meeting
    try {
      const inMeeting = this.isInMeeting();
      await ev.action.setTitle(inMeeting ? "Leave" : "No Meeting");

      // Set state only if this is a KeyAction (not a DialAction)
      if ("setState" in ev.action) {
        await ev.action.setState(inMeeting ? 0 : 1);
      }
    } catch (error) {
      console.error("Error checking Zoom meeting status:", error);
      await ev.action.setTitle("No Meeting");
    }
  }

  /**
   * Leave the Zoom meeting when the button is pressed
   */
  override async onKeyDown(
    ev: KeyDownEvent<ZoomLeaveMeetingSettings>
  ): Promise<void> {
    try {
      // First check if we're in a meeting
      const inMeeting = this.isInMeeting();

      if (inMeeting) {
        // Leave the meeting
        this.leaveMeeting();

        // Brief delay to allow Zoom to update its state
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if we've left the meeting
        const stillInMeeting = this.isInMeeting();

        // Update the button state and title
        if ("setState" in ev.action) {
          await ev.action.setState(stillInMeeting ? 0 : 1);
        }
        await ev.action.setTitle(stillInMeeting ? "Leave" : "No Meeting");
      } else {
        // Not in a meeting, just update the UI
        if ("setState" in ev.action) {
          await ev.action.setState(1);
        }
        await ev.action.setTitle("No Meeting");
      }
    } catch (error) {
      console.error("Error leaving Zoom meeting:", error);
      await ev.action.setTitle("Error");
    }
  }

  /**
   * Leave the current Zoom meeting using AppleScript
   * This works even when Zoom is not the focused application
   */
  private leaveMeeting(): void {
    const script =
      "osascript -e '" +
      "-- Store the current active application to return to it later\n" +
      "set currentApp to (path to frontmost application as text)\n" +
      "\n" +
      "-- Check if Zoom is running\n" +
      'tell application "System Events"\n' +
      '  set zoomRunning to exists (process "zoom.us")\n' +
      "end tell\n" +
      "\n" +
      "if zoomRunning then\n" +
      "  -- Activate Zoom, close the meeting window, and return to previous app\n" +
      '  tell application "zoom.us"\n' +
      "    activate\n" +
      "    delay 0.1 -- Small delay to ensure Zoom is ready\n" +
      "\n" +
      '    tell application "System Events"\n' +
      '      keystroke "w" using {command down}\n' +
      "    end tell\n" +
      "\n" +
      "    -- Return to the original app\n" +
      "    delay 0.2 -- Small delay before switching back\n" +
      "    tell application currentApp\n" +
      "      activate\n" +
      "    end tell\n" +
      "  end tell\n" +
      "else\n" +
      "  -- Zoom is not running\n" +
      '  display notification "Zoom is not running" with title "Stream Deck"\n' +
      "end if" +
      "'";

    execSync(script);
  }

  /**
   * Check if we're currently in a Zoom meeting
   * Returns true if in a meeting, false otherwise
   */
  private isInMeeting(): boolean {
    const script =
      "osascript -e '" +
      'tell application "System Events"\n' +
      "  -- Check if Zoom is running\n" +
      '  if not (exists (process "zoom.us")) then\n' +
      '    return "not_running"\n' +
      "  end if\n" +
      "\n" +
      "  -- Check Zoom meeting status via menu bar items without changing focus\n" +
      '  tell process "zoom.us"\n' +
      "    -- Check if we are in a meeting (presence of Meeting menu item)\n" +
      '    if (exists menu bar item "Meeting" of menu bar 1) then\n' +
      '      return "in_meeting"\n' +
      "    else\n" +
      '      return "not_in_meeting"\n' +
      "    end if\n" +
      "  end tell\n" +
      "end tell" +
      "'";

    try {
      const result = execSync(script).toString().trim();
      return result === "in_meeting";
    } catch (error) {
      // If there's an error, assume we're not in a meeting
      console.error("Error checking Zoom meeting status:", error);
      return false;
    }
  }
}

/**
 * Settings for ZoomLeaveMeeting action
 */
type ZoomLeaveMeetingSettings = {
  // Can be extended with additional settings if needed
};
