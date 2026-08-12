/**
 * Builds a mailto: URL with the interview schedule details pre-filled.
 *
 * The sender address, subject line, and body copy are hardcoded.
 * Only `scheduledAt` and `interviewLink` are dynamic.
 *
 * Returns a mailto: URL string to be used as an <a href> — the user clicks it
 * directly, which opens the OS default mail client (Outlook, Apple Mail, Gmail
 * desktop app, etc.) without any popup blocker interference.
 */

const SENDER_EMAIL = 'shikharsingh.work@gmail.com';

export interface InterviewEmailParams {
  candidateName: string;
  candidateEmail: string;
  customerName: string;
  roundNumber: number;
  roundType: string;
  scheduledAt: string; // ISO or datetime-local string
  interviewLink: string;
}

function formatRoundType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatScheduledAt(raw: string): string {
  if (!raw) return 'TBD';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;
  return date.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function buildMailtoUrl(params: InterviewEmailParams): string {
  const {
    candidateName,
    candidateEmail,
    customerName,
    roundNumber,
    roundType,
    scheduledAt,
    interviewLink,
  } = params;

  const formattedDate = formatScheduledAt(scheduledAt);
  const formattedRoundType = formatRoundType(roundType);

  const subject = `Your Interview Has Been Scheduled — ${customerName}`;

  const body = `Hi ${candidateName},

We are pleased to inform you that your interview has been scheduled. Please find the details below:

  Round       : ${formattedRoundType} (Round ${roundNumber})
  Date & Time : ${formattedDate}
  Interview Link : ${interviewLink || 'To be shared'}

Please join the meeting a few minutes early and ensure your camera and microphone are working beforehand.

If you have any questions or need to reschedule, please reply to this email at the earliest.

We look forward to speaking with you!

Best regards,
GIT Software Technologies RMS
${SENDER_EMAIL}`;

  return (
    `mailto:${encodeURIComponent(candidateEmail)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}
