import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import { ZoomMuteToggle } from "./actions/zoom-mute-toggle";
import { ZoomVideoToggle } from "./actions/zoom-video-toggle";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register all actions
streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new ZoomMuteToggle());
streamDeck.actions.registerAction(new ZoomVideoToggle());

// Finally, connect to the Stream Deck.
streamDeck.connect();
