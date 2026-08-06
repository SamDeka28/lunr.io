/** Query param appended on short-link redirects for conversion attribution. */
export const LUNR_SC_PARAM = "lunr_sc";

/** localStorage key used by the capture + thank-you snippets. */
export const LUNR_SC_STORAGE_KEY = "lunr_sc";

export type InstallSnippets = {
  pixel_url: string;
  postback_url: string;
  pixel_img: string;
  capture_snippet: string;
  thank_you_snippet: string;
  postback_example: string;
};

/** Client-safe: rebuild install snippets when event/value change (token is event-agnostic). */
export function buildInstallSnippets(input: {
  baseUrl: string;
  userId: string;
  campaignId: string;
  token: string;
  eventName: string;
  value?: string;
  currency?: string;
}): InstallSnippets {
  const qs = new URLSearchParams({
    uid: input.userId,
    t: input.token,
    campaign_id: input.campaignId,
    e: input.eventName.trim() || "purchase",
  });
  if (input.value != null && input.value !== "") {
    qs.set("v", input.value);
  }
  if (input.currency) {
    qs.set("cur", input.currency);
  }

  const pixelUrl = `${input.baseUrl}/api/conversions/pixel?${qs.toString()}`;
  const postbackUrl = `${input.baseUrl}/api/conversions/postback?${qs.toString()}`;
  const captureSnippet = `(function(){try{var sc=new URLSearchParams(location.search).get("${LUNR_SC_PARAM}");if(sc)localStorage.setItem("${LUNR_SC_STORAGE_KEY}",sc);}catch(e){}})();`;
  const thankYouSnippet = `(function(){try{var sc=new URLSearchParams(location.search).get("${LUNR_SC_PARAM}")||localStorage.getItem("${LUNR_SC_STORAGE_KEY}")||"";var u=${JSON.stringify(pixelUrl)}+(sc?"&sc="+encodeURIComponent(sc):"");var i=new Image();i.referrerPolicy="no-referrer";i.src=u;}catch(e){}})();`;

  return {
    pixel_url: pixelUrl,
    postback_url: postbackUrl,
    pixel_img: `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />`,
    capture_snippet: captureSnippet,
    thank_you_snippet: thankYouSnippet,
    postback_example: `${postbackUrl}&sc=SHORT_CODE&idk=ORDER_ID`,
  };
}

/** Append lunr_sc to a destination URL for conversion attribution. */
export function appendLunrScParam(
  redirectUrl: string,
  shortCode: string
): string {
  try {
    let url: URL;
    try {
      url = new URL(redirectUrl);
    } catch {
      if (!redirectUrl.includes("://")) {
        url = new URL(`https://${redirectUrl}`);
      } else {
        return redirectUrl;
      }
    }
    if (!url.searchParams.has(LUNR_SC_PARAM)) {
      url.searchParams.set(LUNR_SC_PARAM, shortCode);
    }
    return url.toString();
  } catch {
    return redirectUrl;
  }
}
