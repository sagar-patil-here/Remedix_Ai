import type { CalendarEvent } from "@/lib/types";

/**
 * Builds a Google Calendar "Add Event" URL.
 * When the user clicks this link they are taken to Google Calendar
 * with the event pre-filled. Works with whatever Google account
 * is active in the browser (same one used to sign in via Clerk).
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const { title, description, startDate, startTime, endTime, recurrence, recurrenceCount } = event;

  const formatDateTime = (date: string, time: string) => {
    const clean = date.replace(/-/g, "");
    const cleanTime = time.replace(/:/g, "");
    return `${clean}T${cleanTime}00`;
  };

  const start = formatDateTime(startDate, startTime);
  const end = formatDateTime(startDate, endTime);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    dates: `${start}/${end}`,
  });

  if (recurrence && recurrence !== "NONE" && recurrenceCount) {
    params.set("recur", `RRULE:FREQ=${recurrence};COUNT=${recurrenceCount}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Opens the Google Calendar event creation page in a new tab.
 */
export function addToGoogleCalendar(event: CalendarEvent): void {
  const url = buildGoogleCalendarUrl(event);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Opens multiple events sequentially (one tab per event).
 */
export function addAllToGoogleCalendar(events: CalendarEvent[]): void {
  events.forEach((event, idx) => {
    setTimeout(() => addToGoogleCalendar(event), idx * 600);
  });
}
