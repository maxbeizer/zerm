import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { execSync } from "child_process";

@action({ UUID: "com.max-beizer.zerm.zoom-video-toggle" })
export class ZoomVideoToggle extends SingletonAction<Record<string, never>> {
  override async onWillAppear(
    ev: WillAppearEvent<Record<string, never>>
  ): Promise<void> {
    try {
      const videoEnabled = this.getZoomVideoStatus();
      await ev.action.setTitle(videoEnabled ? "Video On" : "Video Off");

      if ("setState" in ev.action) {
        await ev.action.setState(videoEnabled ? 1 : 0);
      }
    } catch (error) {
      console.error("Error getting Zoom video status:", error);
      await ev.action.setTitle("Zoom?");
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<Record<string, never>>
  ): Promise<void> {
    try {
      this.toggleZoomVideo();

      const videoEnabled = this.getZoomVideoStatus();

      if ("setState" in ev.action) {
        await ev.action.setState(videoEnabled ? 1 : 0);
      }
      await ev.action.setTitle(videoEnabled ? "Video On" : "Video Off");
    } catch (error) {
      console.error("Error toggling Zoom video:", error);
      await ev.action.setTitle("Error");
    }
  }

  private toggleZoomVideo(): void {
    const script = `osascript -e '
      -- Store the current active application to return to it later
      set currentApp to (path to frontmost application as text)
      
      -- Check if Zoom is running
      tell application "System Events"
        set zoomRunning to exists (process "zoom.us")
      end tell
      
      if zoomRunning then
        -- Activate Zoom, toggle video, and return to previous app
        tell application "zoom.us"
          activate
          delay 0.1 -- Small delay to ensure Zoom is ready
          
          tell application "System Events"
            keystroke "v" using {shift down, command down}
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
   * Get the current video status of Zoom
   * Returns true if video is on, false if video is off
   * Works without changing application focus
   */
  private getZoomVideoStatus(): boolean {
    // Execute AppleScript to check Zoom video status without changing focus
    const script = `osascript -e '
      set videoStatus to "unknown"
      
      tell application "System Events"
        -- Check if Zoom is running
        if not (exists (process "zoom.us")) then
          return "not_running"
        end if
        
        -- Check Zoom meeting status via menu bar items without changing focus
        tell process "zoom.us"
          -- Check if we are in a meeting (presence of Meeting menu item)
          if (exists menu bar item "Meeting" of menu bar 1) then
            -- Check video status by checking which menu item exists
            if (exists menu item "Start Video" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set videoStatus to "stopped"
            else if (exists menu item "Stop Video" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set videoStatus to "started"
            end if
          else
            -- Not in a meeting
            return "not_in_meeting"
          end if
        end tell
      end tell
      
      return videoStatus
    '`;

    try {
      const result = execSync(script).toString().trim();
      
      if (result === "not_running" || result === "not_in_meeting") {
        console.log(`Zoom status: ${result}`);
        return false; // Default to video off state for UI
      }
      
      return result === "started";
    } catch (error) {
      // If there's an error, assume Zoom is not running or not in a meeting
      console.error("Error checking Zoom video status:", error);
      return false;
    }
  }
}
