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
      set currentApp to (path to frontmost application as text)

      tell application "System Events"
        set zoomRunning to exists (process "zoom.us")
      end tell

      if zoomRunning then
        tell application "zoom.us"
          activate
          delay 0.1

          tell application "System Events"
            keystroke "v" using {shift down, command down}
          end tell

          delay 0.2
          tell application currentApp
            activate
          end tell
        end tell
      else
        display notification "Zoom is not running" with title "Stream Deck"
      end if
    '`;

    execSync(script);
  }

  private getZoomVideoStatus(): boolean {
    const script = `osascript -e '
      set videoStatus to "unknown"

      tell application "System Events"
        if not (exists (process "zoom.us")) then
          return "not_running"
        end if

        tell process "zoom.us"
          if (exists menu bar item "Meeting" of menu bar 1) then
            if (exists menu item "Start Video" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set videoStatus to "stopped"
            else if (exists menu item "Stop Video" of menu 1 of menu bar item "Meeting" of menu bar 1) then
              set videoStatus to "started"
            end if
          else
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
        return false;
      }

      return result === "started";
    } catch (error) {
      console.error("Error checking Zoom video status:", error);
      return false;
    }
  }
}
