/**
 * Detect crawlers, link-preview agents, and other non-human traffic.
 * Used to record analytics with is_bot=true without incrementing link.click_count.
 */

const KNOWN_PREVIEW_BOTS = [
  "slackbot",
  "twitterbot",
  "facebookexternalhit",
  "facebot",
  "linkedinbot",
  "discordbot",
  "whatsapp",
  "telegrambot",
  "skypeuripreview",
  "applebot",
  "googlebot",
  "bingbot",
  "yandexbot",
  "duckduckbot",
  "baiduspider",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest",
  "redditbot",
  "slack-imgproxy",
  "slackbot-linkexpanding",
  "meta-externalagent",
  "meta-externalfetcher",
  "iframely",
  "bitlybot",
  "tumblr",
  "vkshare",
  "w3c_validator",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "qwantify",
  "pinterestbot",
  "developers.google.com/+/web/snippet",
  // iMessage / Messages link presentation often uses CFNetwork + specific agents
  "com.apple.webkit.networking",
];

const BOT_UA_PATTERNS: RegExp[] = [
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /crawl/i,
  /slurp/i,
  /fetcher/i,
  /preview/i,
  /monitor/i,
  /scraper/i,
  /headless/i,
  /phantomjs/i,
  /selenium/i,
  /puppeteer/i,
  /httpclient/i,
  /python-requests/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /wget/i,
  /curl\//i,
  /http\.rb/i,
  /okhttp/i,
  /scrapy/i,
];

/**
 * Returns true when the User-Agent looks like a bot or link-preview agent.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || !userAgent.trim()) {
    // Empty UA is suspicious for real browsers; treat as bot to avoid inflating counts
    return true;
  }

  const ua = userAgent.toLowerCase();

  for (const known of KNOWN_PREVIEW_BOTS) {
    if (ua.includes(known)) {
      return true;
    }
  }

  for (const pattern of BOT_UA_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }

  return false;
}
