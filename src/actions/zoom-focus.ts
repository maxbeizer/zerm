/**
 * Zoom Focus Action
 *
 * This action brings the Zoom application to the foreground.
 * It's useful when you need to quickly interact with the Zoom interface
 * or access controls that aren't available via keyboard shortcuts.
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
 * Action that focuses the Zoom application
 * Brings Zoom to the foreground when pressed
 */
@action({ UUID: "com.max-beizer.zerm.zoom-focus" })
export class ZoomFocus extends SingletonAction<ZoomFocusSettings> {
  /**
   * When the action appears, set the title
   */
  override async onWillAppear(
    ev: WillAppearEvent<ZoomFocusSettings>
  ): Promise<void> {
    try {
      // Check if Zoom is running
      const isRunning = this.isZoomRunning();
      await ev.action.setTitle(isRunning ? "Focus Zoom" : "No Zoom");

      // Set state only if this is a KeyAction (not a DialAction)
      if ("setState" in ev.action) {
        await ev.action.setState(isRunning ? 0 : 1);
      }
    } catch (error) {
      console.error("Error checking if Zoom is running:", error);
      await ev.action.setTitle("Error");
    }
  }

  /**
   * Focus Zoom when the button is pressed
   */
  override async onKeyDown(ev: KeyDownEvent<ZoomFocusSettings>): Promise<void> {
    try {
      // Focus the Zoom application
      const success = this.focusZoom();

      // Update the button title based on the result
      await ev.action.setTitle(success ? "Focus Zoom" : "No Zoom");
      
      // Update state if Zoom was focused successfully
      if ("setState" in ev.action) {
        await ev.action.setState(success ? 0 : 1);
      }
    } catch (error) {
      console.error("Error focusing Zoom:", error);
      await ev.action.setTitle("Error");
    }
  }

  /**
   * Focus the Zoom application using AppleScript
   * Returns true if Zoom was successfully focused, false otherwise
   */
  private focusZoom(): boolean {
    const script = "osascript -e '" +
      "-- Check if Zoom is running\n" +
      "tell application \"System Events\"\n" +
      "  set zoomRunning to exists (process \"zoom.us\")\n" +
      "end tell\n" +
      "\n" +
      "if zoomRunning then\n" +
      "  -- Focus Zoom\n" +
      "  tell application \"zoom.us\"\n" +
      "    activate\n" +
      "  end tell\n" +
      "  return \"success\"\n" +
      "else\n" +
      "  -- Zoom is not running\n" +
      "  display notification \"Zoom is not running\" with title \"Stream Deck\"\n" +
      "  return \"not_running\"\n" +
      "end if" +
      "'";

    try {
      const result = execSync(script).toString().trim();
      return result === "success";
    } catch (error) {
      console.error("Error focusing Zoom:", error);
      return false;
    }
  }

  /**
   * Check if Zoom is running
   * Returns true if Zoom is running, false otherwise
   */
  private isZoomRunning(): boolean {
    const script = "osascript -e '" +
      "tell application \"System Events\"\n" +
      "  set zoomRunning to exists (process \"zoom.us\")\n" +
      "end tell\n" +
      "\n" +
      "if zoomRunning then\n" +
      "  return \"running\"\n" +
      "else\n" +
      "  return \"not_running\"\n" +
      "end if" +
      "'";

    try {
      const result = execSync(script).toString().trim();
      return result === "running";
    } catch (error) {
      console.error("Error checking if Zoom is running:", error);
      return false;
    }
  }
}

/**
 * Settings for ZoomFocus action
 */
type ZoomFocusSettings = {
  // Can be extended with additional settings if needed
};
