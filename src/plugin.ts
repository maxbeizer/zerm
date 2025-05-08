/**
 * Zerm - A Stream Deck plugin for controlling Zoom
 * 
 * This plugin provides controls for Zoom meetings directly from the Elgato Stream Deck,
 * allowing users to toggle mute and video status even when Zoom is not the active application.
 * 
 * For development guidance, see: .github/copilot-instructions.md
 */
import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { ZoomMuteToggle } from "./actions/zoom-mute-toggle";
import { ZoomVideoToggle } from "./actions/zoom-video-toggle";
import { ZoomShareScreen } from "./actions/zoom-share-screen";
import { ZoomFocus } from "./actions/zoom-focus";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register all actions
streamDeck.actions.registerAction(new ZoomMuteToggle());
streamDeck.actions.registerAction(new ZoomVideoToggle());
streamDeck.actions.registerAction(new ZoomShareScreen());
streamDeck.actions.registerAction(new ZoomFocus());

// Finally, connect to the Stream Deck.
streamDeck.connect();
