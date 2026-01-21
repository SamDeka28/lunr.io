# UTM Tracking with Short URLs - How It Works

## Overview

UTM (Urchin Tracking Module) parameters allow you to track where your traffic comes from and which campaigns drive the most engagement. With short URLs, UTM tracking works in a special way because the short link acts as an intermediary between the user and the final destination.

## How It Works: Step-by-Step Flow

### Scenario 1: Using Default UTM Parameters (Set on Link)

```
1. User clicks: https://yoursite.com/abc123
   ↓
2. System extracts short code: "abc123"
   ↓
3. System looks up link in database
   ↓
4. System retrieves default UTM parameters from link:
   {
     utm_source: "google",
     utm_medium: "cpc",
     utm_campaign: "summer_sale"
   }
   ↓
5. System tracks analytics with these UTM parameters
   ↓
6. System appends UTM parameters to destination URL:
   Original: https://example.com/product
   Final:    https://example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale
   ↓
7. User is redirected to final URL with UTM parameters
```

### Scenario 2: Using Dynamic UTM Parameters (In Request URL)

```
1. User clicks: https://yoursite.com/abc123?utm_source=facebook&utm_medium=social
   ↓
2. System extracts short code: "abc123"
   ↓
3. System extracts UTM parameters from request URL:
   - utm_source: "facebook"
   - utm_medium: "social"
   ↓
4. System checks link defaults (if any)
   ↓
5. Priority: Request URL params > Link defaults
   Final UTM: { source: "facebook", medium: "social" }
   ↓
6. System tracks analytics with these UTM parameters
   ↓
7. System appends UTM parameters to destination URL:
   Original: https://example.com/product
   Final:    https://example.com/product?utm_source=facebook&utm_medium=social
   ↓
8. User is redirected to final URL with UTM parameters
```

### Scenario 3: Mixed (Request URL + Link Defaults)

```
1. User clicks: https://yoursite.com/abc123?utm_source=twitter
   ↓
2. Link has defaults: { source: "google", medium: "cpc", campaign: "summer" }
   ↓
3. System merges (request params take priority):
   Final: { source: "twitter", medium: "cpc", campaign: "summer" }
   ↓
4. System tracks and redirects with merged parameters
```

## Key Features

### 1. **Two Ways to Set UTM Parameters**

**Method A: Default Parameters (Set on Link)**
- Set UTM parameters when creating/editing a link
- These are stored in the database
- Used when no UTM params are in the request URL
- Good for consistent campaign tracking

**Method B: Dynamic Parameters (In URL)**
- Add UTM parameters directly to the short URL
- Example: `yoursite.com/abc123?utm_source=email&utm_medium=newsletter`
- Overrides link defaults if present
- Good for A/B testing or multiple campaigns

### 2. **Priority System**

```
Request URL Parameters > Link Default Parameters
```

If a UTM parameter exists in both places, the request URL value is used.

### 3. **Automatic Appending**

UTM parameters are automatically appended to the destination URL, so:
- Your destination site receives the UTM parameters
- Google Analytics (or other tools) can track them
- You can see which campaigns drive traffic

### 4. **Analytics Tracking**

Every click is tracked with:
- UTM parameters (source, medium, campaign, term, content)
- IP address
- User agent
- Referrer
- Timestamp
- Country (if available)

## Use Cases

### Use Case 1: Social Media Campaign
```
Link: https://yoursite.com/promo
Default UTM: { source: "social", medium: "post", campaign: "summer2024" }

When shared on Facebook:
- User clicks link
- Redirects to: https://example.com/page?utm_source=social&utm_medium=post&utm_campaign=summer2024
- Analytics shows: source=social, medium=post, campaign=summer2024
```

### Use Case 2: Email Campaign
```
Link: https://yoursite.com/newsletter
Dynamic UTM: ?utm_source=email&utm_medium=newsletter&utm_campaign=weekly

When clicked from email:
- User clicks: https://yoursite.com/newsletter?utm_source=email&utm_medium=newsletter&utm_campaign=weekly
- Redirects to: https://example.com/page?utm_source=email&utm_medium=newsletter&utm_campaign=weekly
- Analytics shows: source=email, medium=newsletter, campaign=weekly
```

### Use Case 3: A/B Testing
```
Same link, different UTM parameters:
- Version A: yoursite.com/abc123?utm_content=button_red
- Version B: yoursite.com/abc123?utm_content=button_blue

Both redirect to same destination, but analytics tracks which version performed better.
```

## Technical Implementation

### Code Flow (app/[shortCode]/route.ts)

```typescript
1. Extract UTM from request URL
   const requestUtmSource = requestUrl.searchParams.get("utm_source");

2. Get link defaults
   const linkUtmParams = link.utm_parameters || {};

3. Merge with priority
   const finalUtmSource = requestUtmSource || linkUtmParams.utm_source;

4. Track analytics
   analyticsService.trackClick({
     utm_source: finalUtmSource,
     utm_medium: finalUtmMedium,
     // ... etc
   });

5. Append to destination URL
   const url = new URL(redirectUrl);
   url.searchParams.set('utm_source', finalUtmSource);
   // ... etc

6. Redirect
   return NextResponse.redirect(url.toString());
```

## Benefits

1. **Clean Short URLs**: Your short link stays clean, UTM params are added automatically
2. **Flexible Tracking**: Use defaults or dynamic params based on your needs
3. **Analytics Integration**: Works seamlessly with Google Analytics, Mixpanel, etc.
4. **Campaign Attribution**: Know exactly which campaigns drive traffic
5. **A/B Testing**: Test different variations with the same link

## Best Practices

1. **Always set Source and Medium**: These are the most important parameters
2. **Use consistent naming**: "google" not "Google" or "GOOGLE"
3. **Campaign naming**: Use descriptive names like "summer_sale_2024"
4. **Test before launching**: Use the preview in the form to verify
5. **Monitor analytics**: Check which UTM combinations perform best

## Testing

### Test Default UTM Parameters:
1. Create/edit a link
2. Enable UTM parameters
3. Set source="test", medium="manual"
4. Click your short link
5. Check destination URL has: `?utm_source=test&utm_medium=manual`
6. Check analytics page shows these values

### Test Dynamic UTM Parameters:
1. Get your short link: `yoursite.com/abc123`
2. Add params: `yoursite.com/abc123?utm_source=dynamic&utm_medium=test`
3. Click the link
4. Check destination URL has the dynamic params
5. Check analytics shows dynamic values (not link defaults)

## FAQ

**Q: Do UTM parameters change my short link?**
A: No, your short link stays the same. UTM parameters are only added to the destination URL.

**Q: Can I use both default and dynamic UTM parameters?**
A: Yes! Dynamic parameters in the URL will override defaults for those specific parameters.

**Q: What if my destination URL already has UTM parameters?**
A: The system will append/merge them. If there's a conflict, the new values take precedence.

**Q: Are UTM parameters required?**
A: No, but Source and Medium are recommended for meaningful tracking.

**Q: Can I see UTM tracking in analytics?**
A: Yes! Go to your link's analytics page and check the "UTM Parameters" section.

