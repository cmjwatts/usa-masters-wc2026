---
name: add-team
description: Add Christine's USA O35 teammates as invitees on Google Calendar events. Use whenever Christine says "add the team", "invite the team", "add teammates" to a calendar event (or asks to create a new tournament event with the team on it). Reads the roster from team-invites.json at the repo root.
---

# Add team to calendar events

## What this does

Adds every teammate listed in `team-invites.json` (repo root) as an attendee on
one or more Google Calendar events, so the events show up on their calendars.

## Steps

1. Read `team-invites.json` at the repo root. The `team` array holds
   `{ "name": ..., "email": ... }` entries. If it's empty, ask Christine for
   the emails before doing anything else.
2. Identify the target event(s):
   - If Christine named a specific event ("add the team to the quarterfinal"),
     find it with `mcp__Google_Calendar__list_events` (use `fullText` or a
     narrow time window) on her primary calendar.
   - If she said something broad ("all the team events"), the team-facing
     events are: USA O35 practices, the team meeting, equipment check, all
     W O35 games (pool + knockout), the 🚗 "Arrive @ ..." / "Be on site ..."
     arrival events (the whole team uses these), US Delegation BBQ,
     Opening/Closing Ceremony, Team Dinner, Team Lunch, and the Dutch
     Tournament Party.
   - Do NOT include: the "M O50 ..." men's games (spectating, not her team),
     the "(Optional) O40 ..." events, or any family/hotel/flight events.
3. For each event, call `mcp__Google_Calendar__update_event` with
   `addedAttendees: [{email: ...}, ...]` for every roster member **not already
   on the event's attendee list** (check first; re-adding is harmless but
   re-sends emails). Leave `notificationLevel` at its default so invitees get
   the invite email.
4. If Christine is creating a NEW event and says "add the team", create the
   event with the roster as attendees in the same call.
5. Confirm back: which events were updated and who was added.

## Adding new teammates later

When Christine gives a new teammate's email, append them to the `team` array
in `team-invites.json`, commit the change, and ask whether to also add them to
the existing team events (they won't be on past invites automatically).
