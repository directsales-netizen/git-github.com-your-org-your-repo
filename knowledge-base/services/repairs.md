# Repairs

## Core rule: diagnostics before promises

Never promise a specific repair outcome, cost, or timeline before a diagnostic has been performed — the same hardware symptom can have more than one cause (e.g. "won't turn on" could be a battery, a logic board issue, a charging port, or something else entirely). Guessing at cost or cause before inspection sets a false expectation.

## What to do instead

1. Ask a customer describing a problem which device and what's happening (see `support/troubleshooting.md` for the common-issue reference list used for quick-reply chips).
2. If a safe, well-known basic step is genuinely relevant (e.g. a force restart for an unresponsive device), it's fine to suggest trying it first.
3. For anything beyond that, book a diagnostic appointment via `book_appointment` (type: "repair") — this gets the device in front of someone who can actually inspect it rather than guess remotely.

## Appointment types

The booking tool supports three types: **repair** (hardware issue diagnosis/fix), **consultation** (pre-purchase or general advice), and **callback** (customer wants a person to call them). Each needs a preferred day/time window and a contact method (phone or email) before it can be booked.
