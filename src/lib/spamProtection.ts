const BLOCKED_WORDS = [
  'spam', 'scam', 'fake', 'viagra', 'casino', 'lottery',
  'porn', 'xxx', 'buy now', 'click here', 'free money',
];

const RATE_LIMIT_MS = 30_000;
let lastSubmitTime = 0;
let lastMessage = '';

export function validateReview(name: string, message: string): string | null {
  if (!name.trim()) return 'Name is required.';
  if (message.trim().length < 20) return 'Review must be at least 20 characters.';

  const lower = message.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return 'Your review contains inappropriate content.';
  }

  return null;
}

export function checkRateLimit(): string | null {
  const now = Date.now();
  if (now - lastSubmitTime < RATE_LIMIT_MS) {
    const secs = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
    return `Please wait ${secs}s before submitting again.`;
  }
  return null;
}

export function checkDuplicate(message: string): string | null {
  if (message.trim() === lastMessage.trim() && lastMessage.length > 0) {
    return 'Duplicate review detected. Please write a unique review.';
  }
  return null;
}

export function recordSubmission(message: string) {
  lastSubmitTime = Date.now();
  lastMessage = message;
}

export function isHoneypotFilled(value: string): boolean {
  return value.length > 0;
}