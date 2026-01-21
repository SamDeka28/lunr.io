# Custom Domains Configuration Guide

## How It Works

The custom domain system allows users to connect their own domain (e.g., `example.com`) to their Lunr page. Here's how the complete flow works:

### 1. **Domain Registration** (What we do)
When a user adds a custom domain:
- We store the domain name in the `custom_domains` table
- We generate a verification token
- We create DNS record instructions (CNAME + TXT)

### 2. **DNS Configuration** (What the user does)
The user needs to add DNS records at their domain provider:

**CNAME Record:**
- **Name:** `example.com` (or `@` depending on provider)
- **Value:** Your app domain (e.g., `lunr.to`)
- **Purpose:** Points the custom domain to your server

**TXT Record (for verification):**
- **Name:** `_lunr-verification.example.com`
- **Value:** [Generated verification token]
- **Purpose:** Proves domain ownership

### 3. **Domain Verification** (What we do)
When the user clicks "Verify":
- We check DNS records using Cloudflare DNS over HTTPS
- We verify both CNAME and TXT records exist and match
- We update the domain status to "verified"

### 4. **Request Routing** (What we do - NEW!)
When someone visits `https://example.com`:
- **Middleware** (`middleware.ts`) intercepts the request
- Checks if the hostname is a custom domain (not our main domain)
- Looks up the domain in the database
- If verified, rewrites the request to `/p/[page-slug]`
- The page is served normally through the existing route

### 5. **SSL/HTTPS** (Future implementation)
- SSL certificates need to be provisioned (Let's Encrypt, etc.)
- This typically requires:
  - A certificate management service
  - Automatic renewal
  - Integration with your hosting/CDN

## Current Implementation Status

✅ **Completed:**
- Domain storage and management
- DNS record generation
- Domain verification (CNAME + TXT check)
- Request routing via middleware
- UI for domain management

⚠️ **Still Needed for Production:**
- SSL certificate provisioning
- CDN/Edge configuration for custom domains
- Domain routing at infrastructure level (Vercel, Cloudflare, etc.)

## How Users Configure It

1. **Add Domain:**
   - User enters `example.com` in the page settings
   - System generates DNS instructions

2. **Configure DNS:**
   - User goes to their domain provider (GoDaddy, Namecheap, etc.)
   - Adds the CNAME and TXT records as instructed
   - Waits for DNS propagation (usually 5-60 minutes)

3. **Verify Domain:**
   - User clicks "Verify" button
   - System checks DNS records
   - If correct, domain is marked as verified

4. **Access Page:**
   - Once verified, `https://example.com` serves the page
   - All requests are automatically routed to the correct page

## Technical Details

### Middleware Routing
The middleware checks:
- If hostname ≠ main app domain
- If hostname is a verified custom domain
- If the associated page is active and public
- Then rewrites the request to `/p/[slug]`

### DNS Verification
Uses Cloudflare DNS over HTTPS API:
- Serverless-compatible (works in Next.js Edge/Serverless)
- No need for Node.js `dns` module
- Checks both CNAME and TXT records

### Database Schema
- `custom_domains` table stores domain info
- Links to `pages` table via `page_id`
- Tracks verification and SSL status

## Production Considerations

For production deployment, you'll need:

1. **Infrastructure Setup:**
   - Configure your hosting/CDN to accept custom domains
   - Set up wildcard SSL or automatic certificate provisioning
   - Configure DNS at your edge/CDN level

2. **Vercel Example:**
   ```bash
   # Add domain via Vercel CLI
   vercel domains add example.com
   ```

3. **Cloudflare Example:**
   - Use Cloudflare Workers or Pages
   - Configure custom domains in dashboard
   - Automatic SSL via Cloudflare

4. **Self-Hosted:**
   - Use reverse proxy (Nginx, Caddy)
   - Automatic SSL with Let's Encrypt
   - Configure DNS to point to your server

## Security Considerations

- Only verified domains can serve pages
- Domain ownership verified via TXT record
- Pages must be active and public
- SSL required for production (HTTPS only)

