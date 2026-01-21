export const docsContent = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "Zap",
    description: "Learn the basics and get up and running quickly",
    articles: [
      {
        id: "introduction",
        title: "Introduction to lunr.to",
        content: `lunr.to is a comprehensive link management platform that helps you shorten URLs, track performance, generate QR codes, and create beautiful landing pages.

## What is lunr.to?

lunr.to is an all-in-one solution for link management, designed for individuals, professionals, and businesses. Whether you're a content creator sharing links on social media, a marketer running campaigns, or an enterprise managing thousands of links, lunr.to provides the tools you need.

## Key Features

- **Link Shortening**: Create short, memorable links instantly
- **QR Code Generation**: Generate QR codes for offline sharing
- **Custom Pages**: Create beautiful, customizable landing pages
- **Advanced Analytics**: Track clicks, referrers, geographic data, and more
- **Campaign Management**: Organize links into campaigns and track performance
- **Custom Domains**: Use your own domain for branded links
- **Real-time Tracking**: See click counts and analytics update in real-time`,
      },
      {
        id: "creating-account",
        title: "Creating Your Account",
        content: `Getting started with lunr.to is quick and easy.

## Sign Up Process

1. **Visit the Home Page**: Go to the lunr.to homepage
2. **Click "Get Started Free"**: This will take you to the sign-up page
3. **Enter Your Email**: Provide your email address
4. **Create a Password**: Choose a strong password
5. **Verify Your Email**: Check your inbox for a verification email
6. **Start Creating Links**: Once verified, you can immediately start creating links

## Free Plan Benefits

With the free plan, you get:
- 2 short links
- 2 QR codes
- Basic analytics
- Real-time tracking
- Custom back-halves

No credit card required!`,
      },
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        content: `Your dashboard is the central hub for managing all your links, QR codes, pages, and campaigns.

## Navigation

The dashboard includes several key sections:

- **Home**: Overview of your account, quick stats, and recent activity
- **Links**: Manage all your shortened links
- **QR Codes**: Generate and manage QR codes
- **Pages**: Create and customize landing pages
- **Analytics**: View detailed analytics across all your links
- **Campaigns**: Organize links into campaigns
- **Custom Domains**: Manage your custom domains
- **Billing**: View and manage your subscription
- **Settings**: Account and profile settings

## Quick Actions

From the dashboard, you can:
- Create new links instantly
- Generate QR codes
- View analytics
- Manage your account`,
      },
    ],
  },
  {
    id: "links",
    title: "Link Shortening",
    icon: "Link2",
    description: "Create, manage, and customize your short links",
    articles: [
      {
        id: "creating-links",
        title: "Creating Short Links",
        content: `Creating short links is the core feature of lunr.to.

## Basic Link Creation

1. **Navigate to Links**: Click "Links" in the sidebar
2. **Click "Create Link"**: Use the quick create form or the full form
3. **Enter Your URL**: Paste the long URL you want to shorten
4. **Optional Customizations**:
   - Add a custom back-half (Pro plan and above)
   - Set an expiration date (Pro plan and above)
   - Add UTM parameters for tracking (Pro plan and above)
   - Assign to a campaign (optional)
   - Add a title for easy identification
5. **Click "Create"**: Your short link is ready!

## Custom Back-Halves

With Pro plan and above, you can create custom short codes like:
- \`lunr.to/mybrand\`
- \`lunr.to/product-launch\`
- \`lunr.to/special-offer\`

Custom back-halves must be:
- 2-20 characters long
- Alphanumeric or hyphens only
- Unique (not already taken)`,
      },
      {
        id: "link-settings",
        title: "Link Settings & Options",
        content: `Each link can be customized with various settings.

## Link Expiration

Set an expiration date for your links (Pro plan and above):
- Links automatically stop working after the expiration date
- Useful for time-sensitive promotions or campaigns
- You'll receive a notification before expiration

## UTM Parameters

Track your marketing campaigns with UTM parameters (Pro plan and above):
- Automatically append UTM tags to your links
- Track source, medium, campaign, term, and content
- View UTM data in your analytics dashboard

## Link Management

- **Edit**: Update link title, expiration, UTM parameters, or campaign
- **Copy**: Quickly copy the short URL
- **Share**: Share via social media or email
- **Analytics**: View detailed click analytics
- **Delete**: Remove links you no longer need`,
      },
      {
        id: "bulk-operations",
        title: "Bulk Link Management",
        content: `Manage multiple links at once for efficiency.

## Selecting Links

- Use checkboxes to select individual links
- Select all links on the current page
- Filter links before selecting

## Bulk Actions

Currently, you can select multiple links for future bulk operations. Individual link management is available:
- **Delete**: Remove individual links
- **Edit**: Update individual links
- **Copy**: Copy individual link URLs

*Note: Bulk export, tagging, and archiving features are coming soon.*

## Filters & Search

- **Search**: Find links by title, URL, or short code
- **Filter by Date**: View links created in specific time periods (Today, Last 7 days, Last 30 days, This month, Last month, Custom range)
- **Filter by Status**: Active links
- **View Toggle**: Switch between list, grid, and card views`,
      },
    ],
  },
  {
    id: "qr-codes",
    title: "QR Codes",
    icon: "QrCode",
    description: "Generate and track QR codes for your links",
    articles: [
      {
        id: "generating-qr",
        title: "Generating QR Codes",
        content: `QR codes make it easy to share links offline.

## Creating QR Codes

1. **Navigate to QR Codes**: Click "QR Codes" in the sidebar
2. **Click "Generate QR Code"**: Start the creation process
3. **Select a Link**: Choose an existing link or create a new one
4. **Generate**: Your QR code is created instantly
5. **Download**: Download in PNG format for printing or sharing

## QR Code Features

- **High Quality**: Download in high resolution for printing
- **Instant Generation**: Create QR codes in seconds
- **Link Integration**: Automatically linked to your shortened URLs
- **Analytics**: Track scans and clicks through your link analytics

## Best Practices

- Use high contrast colors for better scanning
- Ensure sufficient size when printing (minimum 2x2 cm)
- Test QR codes before printing large batches
- Keep QR codes clean and unobstructed`,
      },
      {
        id: "qr-analytics",
        title: "QR Code Analytics",
        content: `Track how your QR codes are performing.

## Viewing QR Analytics

1. Navigate to QR Codes
2. Click on a QR code
3. Select "Analytics" tab
4. View detailed statistics

## Available Metrics

- **Total Scans**: Number of times the QR code was scanned
- **Unique Scans**: Number of unique devices that scanned
- **Click-through Rate**: Percentage of scans that resulted in clicks
- **Geographic Data**: Where scans originated
- **Device Types**: Mobile vs desktop usage
- **Time-based Data**: When scans occurred

## Use Cases

- Track offline marketing campaigns
- Measure event attendance
- Monitor print material performance
- Analyze physical marketing effectiveness`,
      },
    ],
  },
  {
    id: "pages",
    title: "Custom Pages",
    icon: "FileText",
    description: "Create beautiful landing pages for your links",
    articles: [
      {
        id: "creating-pages",
        title: "Creating Landing Pages",
        content: `Create beautiful, customizable landing pages for your links.

## Page Creation

1. **Navigate to Pages**: Click "Pages" in the sidebar
2. **Click "Create Page"**: Start the page studio
3. **Add Basic Info**:
   - Page title
   - Description
   - Slug (URL-friendly identifier)
4. **Add Links**: Add multiple links to your page
5. **Customize Design**: Use the design tab to customize appearance
6. **Choose Layout**: Select from various layout templates
7. **Publish**: Make your page public and share the URL

## Page Features

- **Multiple Layouts**: Choose from 9+ professional layouts
- **Custom Themes**: Apply predefined themes or create custom designs
- **Typography Control**: Customize fonts, sizes, and weights
- **Color Customization**: Set background, text, and button colors
- **Social Icons**: Add social media links with customizable icons
- **Banners**: Add promotional banners (text or image)
- **Profile Images**: Add profile pictures to personalize pages`,
      },
      {
        id: "page-customization",
        title: "Page Customization",
        content: `Customize every aspect of your landing pages.

## Design Tab

The design tab includes several sections:

### Themes
- Apply predefined themes with one click
- Themes include: Ocean Breeze, Sunset Glow, Forest Green, Minimal White, Dark Mode, and more
- Each theme applies complete design settings

### Background
- **Solid Color**: Choose a solid background color
- **Gradient**: Create custom gradients with color pickers
- **Image**: Upload background images with opacity control

### Colors
- Background color
- Text color
- Button color
- Button text color

### Typography
- Font family (Google Fonts supported)
- Title font size and weight
- Description font size and weight
- Button font size and weight
- Line height and spacing

### Layout Templates

Choose from professional layouts:
- **Classic Centered**: Traditional centered layout
- **Hero Style**: Large hero section with prominent CTA
- **Split Screen**: Two-column layout with image and content
- **Grid Style**: Grid-based link layout
- **Magazine Style**: Editorial-style layout
- **And more...**

## Content Tab

- Add and manage links
- Reorder links with drag-and-drop
- Add social media links
- Configure link display options`,
      },
      {
        id: "page-analytics",
        title: "Page Analytics",
        content: `Track how visitors interact with your pages.

## Viewing Page Analytics

1. Navigate to Pages
2. Click on a page
3. Select "Analytics" tab
4. View comprehensive statistics

## Available Metrics

- **Page Views**: Total number of page visits
- **Link Clicks**: Clicks on individual links
- **Click-through Rate**: Percentage of visitors who clicked links
- **Top Links**: Most clicked links on the page
- **Geographic Data**: Visitor locations
- **Device Types**: Mobile vs desktop visitors
- **Time-based Data**: Traffic patterns over time

## Use Cases

- Measure bio link performance
- Track campaign landing pages
- Analyze user engagement
- Optimize page layouts based on data`,
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: "BarChart3",
    description: "Track performance and understand your audience",
    articles: [
      {
        id: "understanding-analytics",
        title: "Understanding Analytics",
        content: `Analytics help you understand how your links are performing.

## Accessing Analytics

- **Link Analytics**: Click on any link and select "Analytics"
- **Page Analytics**: Click on any page and select "Analytics"
- **Campaign Analytics**: View campaign-level analytics
- **Global Analytics**: Overview of all your links

## Key Metrics

### Click Metrics
- **Total Clicks**: Total number of clicks
- **Unique Clicks**: Number of unique visitors
- **Click-through Rate**: Percentage of unique vs total clicks

### Geographic Data
- **Countries**: Top countries by clicks
- Geographic distribution charts

*Note: City-level data and map visualizations are coming soon.*

### Referrer Data
- **Top Referrers**: Where your traffic is coming from
- **Direct Traffic**: Visitors typing URL directly
- **Social Media**: Traffic from social platforms

### Device & Browser
- **Device Types**: Mobile, desktop, tablet
- **Browsers**: Chrome, Safari, Firefox, etc.

*Note: Operating system breakdown is coming soon.*

### Time-based Data
- **Clicks by Date**: Daily, weekly, monthly trends
- **Clicks by Hour**: Peak traffic times
- **Clicks by Day of Week**: Weekly patterns`,
      },
      {
        id: "analytics-dashboard",
        title: "Analytics Dashboard",
        content: `The analytics dashboard provides a comprehensive view of your performance.

## Dashboard Overview

The main analytics page shows:
- Total clicks across all links
- Unique clicks
- Top performing links
- Quick stats and trends

## Available Analytics Views

- **Link Analytics**: Detailed analytics for individual links
- **Campaign Analytics**: Aggregate analytics for campaigns
- **Global Analytics**: Overview of all your links

## Charts & Visualizations

- **Line Charts**: Time-series click data
- **Bar Charts**: Top referrers, countries
- **Doughnut Charts**: Country and device distribution
- **UTM Tracking**: UTM source, medium, and campaign breakdowns

*Note: Custom date range filtering and CSV export are coming soon.*`,
      },
    ],
  },
  {
    id: "campaigns",
    title: "Campaigns",
    icon: "Monitor",
    description: "Organize links into campaigns and track performance",
    articles: [
      {
        id: "creating-campaigns",
        title: "Creating Campaigns",
        content: `Organize your links into campaigns for better management.

## Campaign Creation

1. **Navigate to Campaigns**: Click "Campaigns" in the sidebar
2. **Click "Create Campaign"**: Start a new campaign
3. **Add Campaign Details**:
   - Campaign name
   - Description
   - Start and end dates
   - Campaign type (product launch, seasonal promo, etc.)
   - Tags for organization
4. **Add Links**: Assign links to the campaign
5. **Set Targets**: Optional click targets
6. **Save**: Your campaign is ready

## Campaign Types

- **Product Launch**: For new product releases
- **Seasonal Promo**: Holiday and seasonal campaigns
- **Email Marketing**: Email campaign tracking
- **Social Media**: Social media campaigns
- **Custom**: Create your own campaign types

## Campaign Features

- **Link Organization**: Group related links together
- **Performance Tracking**: Track campaign-level metrics
- **Campaign Analytics**: View aggregate analytics for all links in a campaign
- **Campaign Management**: Create, edit, and delete campaigns

*Note: Target setting, budget tracking, and tags are coming soon.*`,
      },
      {
        id: "campaign-analytics",
        title: "Campaign Analytics",
        content: `Track the performance of your entire campaigns.

## Campaign Dashboard

View comprehensive campaign statistics:
- Total campaign clicks
- Unique clicks
- Average clicks per link
- Click-through rates
- Campaign performance over time

## Campaign Comparison

Compare multiple campaigns:
- Side-by-side performance metrics
- Identify top-performing campaigns
- Learn from successful strategies

## Campaign Analytics

View comprehensive campaign statistics:
- Total campaign clicks
- Unique clicks
- Average clicks per link
- Click-through rates
- Campaign performance over time
- Geographic and referrer data

*Note: Report generation and sharing are coming soon.*`,
      },
    ],
  },
  {
    id: "custom-domains",
    title: "Custom Domains",
    icon: "Globe",
    description: "Use your own domain for branded links",
    articles: [
      {
        id: "setting-up-domains",
        title: "Setting Up Custom Domains",
        content: `Use your own domain for branded short links.

## Domain Requirements

Custom domains are available on:
- **Business Plan**: 1 custom domain
- **Enterprise Plan**: Unlimited custom domains

## Adding a Domain

1. **Navigate to Custom Domains**: Click "Custom Domains" in the sidebar
2. **Click "Add Domain"**: Enter your domain name
3. **Configure DNS**: Follow the DNS setup instructions
4. **Verify Domain**: Click "Verify" to check DNS configuration
5. **Wait for SSL**: SSL certificate is provisioned automatically

## DNS Configuration

You'll need to add two DNS records:

### CNAME Record
- **Type**: CNAME
- **Name**: Your domain (e.g., \`links.yourdomain.com\`)
- **Value**: \`lunr.to\` (or your app domain)

### TXT Record (Verification)
- **Type**: TXT
- **Name**: \`_lunr-verification.yourdomain.com\`
- **Value**: Verification token (provided by lunr.to)

## Verification Process

1. Add DNS records at your domain provider
2. Wait for DNS propagation (can take up to 48 hours)
3. Click "Verify" in lunr.to
4. System checks both CNAME and TXT records
5. Once verified, domain is active

## Using Custom Domains

After verification:
- Create links using your custom domain
- All links will use your branded domain
- SSL certificate is automatically provisioned
- Works with all link features`,
      },
      {
        id: "domain-troubleshooting",
        title: "Domain Troubleshooting",
        content: `Common issues and solutions for custom domains.

## DNS Not Propagating

**Issue**: Domain verification fails
**Solutions**:
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Use online DNS checker tools
- Contact your domain provider

## SSL Certificate Issues

**Issue**: SSL certificate not provisioning
**Solutions**:
- Ensure domain is verified
- Wait for automatic SSL provisioning (can take up to 24 hours)
- Check domain DNS is correctly configured
- Contact support if issues persist

## Domain Already in Use

**Issue**: Domain already connected to another account
**Solutions**:
- Remove domain from other account first
- Contact support if you believe this is an error

## Best Practices

- Use a subdomain (e.g., \`links.yourdomain.com\`) rather than root domain
- Keep DNS records active
- Don't delete verification TXT record after setup
- Monitor domain status regularly`,
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Plans",
    icon: "CreditCard",
    description: "Manage your subscription and billing",
    articles: [
      {
        id: "plans-pricing",
        title: "Plans & Pricing",
        content: `Choose the plan that fits your needs.

## Available Plans

### Free Plan
- **Price**: $0/month
- **Includes**:
  - 2 short links
  - 2 QR codes
  - Basic analytics
  - Real-time tracking
- **Perfect for**: Getting started, personal use

### Pro Plan
- **Price**: $9.99/month or $99.99/year (save 17%)
- **Includes**:
  - 100 links
  - 100 QR codes
  - 5 custom pages
  - Advanced analytics
  - Custom back-halves
  - Link expiration
  - UTM parameters
- **Perfect for**: Professionals, small teams

### Business Plan
- **Price**: $29.99/month or $299.99/year (save 17%)
- **Includes**:
  - 1,000 links
  - 1,000 QR codes
  - 50 custom pages
  - Custom domains
  - Team collaboration
  - Advanced analytics
  - Priority support
- **Perfect for**: Growing businesses

### Enterprise Plan
- **Price**: $99.99/month or $999.99/year (save 17%)
- **Includes**:
  - Unlimited links
  - Unlimited QR codes
  - Unlimited pages
  - Custom domains
  - API access
  - Team collaboration
  - Priority support
  - Dedicated account manager
- **Perfect for**: Large organizations

## Upgrading Plans

1. Navigate to Billing
2. Select your desired plan
3. Choose monthly or yearly billing
4. Complete payment (Stripe)
5. Plan upgrade is instant

## Plan Limits

- Links, QR codes, and pages count toward your plan limits
- You'll receive notifications when approaching limits
- Upgrade anytime to increase limits
- Enterprise plans offer unlimited resources`,
      },
      {
        id: "billing-management",
        title: "Billing Management",
        content: `Manage your subscription and billing.

## Viewing Billing

Access billing from:
- Dashboard sidebar: "Billing"
- User menu: "Billing"
- Settings page

## Billing Information

View:
- Current plan and usage
- Subscription history
- Payment methods
- Invoices (coming soon)

## Usage Summary

Monitor your usage:
- Links used vs. limit
- QR codes used vs. limit
- Pages used vs. limit
- Visual progress bars

## Subscription Management

- **Upgrade**: Move to a higher plan
- **Downgrade**: Move to a lower plan (at end of billing period)
- **Cancel**: Cancel subscription (access until period ends)
- **Renew**: Automatic renewal unless cancelled

## Payment Methods

- Add credit/debit cards
- Update payment information
- Set default payment method
- View payment history`,
      },
    ],
  },
  {
    id: "api",
    title: "API (Enterprise)",
    icon: "Code",
    description: "Programmatic access to lunr.to",
    articles: [
      {
        id: "api-overview",
        title: "API Overview",
        content: `Programmatic access to lunr.to (Enterprise plan only).

## API Access

API access is available on Enterprise plans. It allows you to:
- Create and manage links programmatically
- Retrieve analytics data
- Integrate with your existing systems
- Automate link management workflows

## Getting Started

1. **Enable API Access**: Ensure you're on an Enterprise plan
2. **Create API Key**: Go to Settings → API Keys and create a new key
3. **Copy Your Key**: Save your API key securely (you won't see it again!)
4. **Start Making Requests**: Use your API key in the \`Authorization\` header

## Authentication

All API requests must include your API key in the Authorization header:

\`\`\`
Authorization: Bearer sk_your_api_key_here
\`\`\`

Or alternatively:

\`\`\`
Authorization: ApiKey sk_your_api_key_here
\`\`\`

## Base URL

All API endpoints are available at:

\`\`\`
https://your-domain.com/api/v1
\`\`\`

<!-- CTA:API_REFERENCE -->

## Complete API Documentation

For detailed API documentation including all endpoints, request/response formats, code examples in multiple languages (cURL, JavaScript, Python, PHP), and interactive guides, visit our **[API Reference](/api-reference)** page.

The API Reference includes:

- **All Available Endpoints** - Complete list with detailed descriptions
- **Multi-language Code Examples** - cURL, JavaScript, Python, and PHP
- **Request & Response Formats** - Detailed parameter tables and response body examples
- **Interactive Documentation** - Copy-to-clipboard functionality for easy integration
- **Endpoint Categories** - Organized by Links, QR Codes, Campaigns, Webhooks, and Usage Analytics

## Rate Limits

- **Enterprise Plans**: 10,000 requests per hour per API key
- Rate limit headers are included in responses
- Contact support for higher limits

## Response Format

All responses are in JSON format. Successful responses return status codes 200-299. Error responses include an \`error\` field with a descriptive message.

## Webhooks

Webhooks allow you to receive real-time notifications when events occur in your account.

### Setting Up Webhooks

1. **Create a Webhook Endpoint**: Set up an HTTP endpoint on your server that can receive POST requests
2. **Create a Webhook via API**: Use the \`POST /api/v1/webhooks\` endpoint to register your webhook
3. **Save the Secret**: The webhook secret is returned only once upon creation - save it securely!
4. **Verify Signatures**: Always verify webhook signatures to ensure authenticity

### Example: Creating a Webhook

\`\`\`bash
curl -X POST https://your-domain.com/api/v1/webhooks \\
  -H "Authorization: Bearer sk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Link Created Webhook",
    "url": "https://your-server.com/webhooks",
    "events": ["link.created", "link.updated"]
  }'
\`\`\`

### Supported Events

- \`link.created\` - Triggered when a link is created
- \`link.updated\` - Triggered when a link is updated
- \`link.deleted\` - Triggered when a link is deleted
- \`link.clicked\` - Triggered when a link is clicked

### Webhook Payload

Webhooks send POST requests to your configured URL with the following headers:

- \`X-Webhook-Event\` - The event type (e.g., "link.created")
- \`X-Webhook-Signature\` - HMAC SHA256 signature for verification
- \`X-Webhook-Id\` - The webhook ID

The request body contains the event data (link object, etc.).

### Verifying Webhook Signatures

Always verify webhook signatures to ensure the request is authentic:

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}

// In your webhook handler
const signature = req.headers['x-webhook-signature'];
const isValid = verifyWebhook(JSON.stringify(req.body), signature, webhookSecret);
\`\`\`

### Best Practices

- Use HTTPS for webhook URLs
- Implement idempotency to handle duplicate events
- Respond with 2xx status codes quickly (within 5 seconds)
- Monitor webhook failure counts
- Rotate webhook secrets periodically

## Security Best Practices

- Keep your API keys secure and never commit them to version control
- Rotate API keys regularly
- Use different keys for different environments (production, development)
- Monitor API key usage in your dashboard
- Revoke unused or compromised keys immediately
- Verify webhook signatures to ensure authenticity
- Use HTTPS for webhook URLs

For more examples and complete endpoint documentation, visit the [API Reference](/api-reference) page.`,
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    icon: "HelpCircle",
    description: "Frequently asked questions and troubleshooting",
    articles: [
      {
        id: "common-questions",
        title: "Common Questions",
        content: `Frequently asked questions about lunr.to.

## General Questions

**Q: How does link shortening work?**
A: When you create a short link, we store your original URL and generate a unique short code. When someone clicks your short link, they're instantly redirected to your original URL while we track the click data.

**Q: Are my links permanent?**
A: Links are permanent unless you set an expiration date or delete them. Expired links stop working but remain in your account for historical reference.

**Q: Can I edit a link after creation?**
A: Yes, you can edit link titles, expiration dates, UTM parameters, and campaign assignments. The short code and original URL cannot be changed - create a new link if needed.

**Q: What happens if I exceed my plan limits?**
A: You'll receive email notifications when approaching limits. Upgrade your plan to create more links, QR codes, or pages.

## Technical Questions

**Q: How secure is my data?**
A: We use enterprise-grade security with Row Level Security (RLS), encrypted data storage, and secure authentication. Your data is private and only accessible by you.

**Q: Do you store click data?**
A: Yes, we store click analytics data including IP addresses (anonymized), referrers, device types, and geographic data. This data is used only for analytics and is never shared.

**Q: Can I export my data?**
A: Data export features are coming soon. Enterprise plans will include API access for programmatic data retrieval.

**Q: What browsers are supported?**
A: lunr.to works on all modern browsers including Chrome, Firefox, Safari, and Edge.`,
      },
      {
        id: "troubleshooting",
        title: "Troubleshooting",
        content: `Solutions to common issues.

## Link Issues

**Link not redirecting:**
- Check if link is expired
- Verify link is active (not archived)
- Clear browser cache
- Try in incognito mode

**Custom back-half not working:**
- Ensure you're on Pro plan or higher (custom back-halves are a premium feature)
- Check back-half is unique
- Verify format (alphanumeric + hyphens only, 2-20 characters)

## Analytics Issues

**Analytics not updating:**
- Analytics update in real-time but may have slight delays
- Refresh the page
- Check if link is receiving clicks
- Verify link is active

**Missing data:**
- Some data may take time to process
- Geographic data requires IP geolocation
- Some referrers may be blocked by privacy tools

## Account Issues

**Can't log in:**
- Check email and password
- Use password reset if needed
- Verify email is confirmed
- Contact support if issues persist

**Plan features not available:**
- Verify plan upgrade completed
- Refresh page or log out/in
- Check billing status
- Contact support

## Getting Help

- Check this documentation
- Contact support via email
- Enterprise customers: Contact account manager`,
      },
    ],
  },
];

