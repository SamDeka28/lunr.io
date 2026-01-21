"use client";

import { useState } from "react";
import { Code, Link2, Monitor, Radio, BarChart3, Key, Copy, Check, QrCode, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import Link from "next/link";
import { CodeEditor } from "@/components/code-editor";

type Language = "curl" | "javascript" | "python" | "php";

interface CodeExample {
  language: Language;
  label: string;
  code: string;
}

interface ResponseExample {
  status: number;
  description: string;
  body: string;
}

interface Endpoint {
  method: string;
  path: string;
  title: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: Record<string, any>;
  responses: ResponseExample[];
  examples: CodeExample[];
}

interface EndpointCategory {
  id: string;
  category: string;
  icon: React.ComponentType<any>;
  description: string;
  endpoints: Endpoint[];
}

// Helper function to generate code examples
const generateExamples = (
  method: string,
  path: string,
  body?: Record<string, any>
): CodeExample[] => {
  const baseUrl = "https://your-domain.com";
  // Path already includes /api/v1, so just concatenate
  const fullUrl = `${baseUrl}${path}`;
  const apiKey = "sk_your_api_key_here";

  const examples: CodeExample[] = [];

  // cURL
  let curlCode = `curl -X ${method} ${fullUrl} \\\n  -H "Authorization: Bearer ${apiKey}"`;
  if (body && Object.keys(body).length > 0) {
    curlCode += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body, null, 2)}'`;
  }
  examples.push({ language: "curl", label: "cURL", code: curlCode });

  // JavaScript (fetch)
  let jsCode = `const response = await fetch('${fullUrl}', {\n  method: '${method}',\n  headers: {\n    'Authorization': 'Bearer ${apiKey}',`;
  if (body && Object.keys(body).length > 0) {
    jsCode += `\n    'Content-Type': 'application/json',`;
  }
  jsCode += `\n  },`;
  if (body && Object.keys(body).length > 0) {
    jsCode += `\n  body: JSON.stringify(${JSON.stringify(body, null, 2)}),`;
  }
  jsCode += `\n});\n\nconst data = await response.json();`;
  examples.push({ language: "javascript", label: "JavaScript", code: jsCode });

  // Python (requests)
  let pythonCode = `import requests\n\nurl = "${fullUrl}"\nheaders = {\n    "Authorization": "Bearer ${apiKey}"`;
  if (body && Object.keys(body).length > 0) {
    pythonCode += `,\n    "Content-Type": "application/json"`;
  }
  pythonCode += `\n}`;
  if (body && Object.keys(body).length > 0) {
    pythonCode += `\n\ndata = ${JSON.stringify(body, null, 2)}\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=data)`;
  } else {
    pythonCode += `\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers)`;
  }
  pythonCode += `\nresult = response.json()`;
  examples.push({ language: "python", label: "Python", code: pythonCode });

  // PHP
  let phpCode = `<?php\n\n$url = "${fullUrl}";\n$headers = [\n    "Authorization: Bearer ${apiKey}"`;
  if (body && Object.keys(body).length > 0) {
    phpCode += `,\n    "Content-Type: application/json"`;
  }
  phpCode += `\n];`;
  if (body && Object.keys(body).length > 0) {
    phpCode += `\n\n$data = ${JSON.stringify(body, null, 2)};\n\n$ch = curl_init($url);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));\n$response = curl_exec($ch);\ncurl_close($ch);\n$result = json_decode($response, true);`;
  } else {
    phpCode += `\n\n$ch = curl_init($url);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n$response = curl_exec($ch);\ncurl_close($ch);\n$result = json_decode($response, true);`;
  }
  examples.push({ language: "php", label: "PHP", code: phpCode });

  return examples;
};

const apiCategories: EndpointCategory[] = [
  {
    id: "getting-started",
    category: "Getting Started",
    icon: Code,
    description: "Learn how to authenticate and make your first API request.",
    endpoints: [],
  },
  {
    id: "links",
    category: "Links",
    icon: Link2,
    description: "Create, manage, and track your shortened links programmatically.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/links",
        title: "List all links",
        description: "Retrieve a list of all your shortened links. Returns links ordered by creation date (newest first). If a link has an associated QR code, it will be included in the qr_code field (null if no QR code exists).",
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              links: [
                {
                  id: "550e8400-e29b-41d4-a716-446655440000",
                  short_code: "abc123",
                  short_url: "https://your-domain.com/abc123",
                  original_url: "https://example.com",
                  title: "Example Link",
                  click_count: 42,
                  created_at: "2024-01-15T10:30:00Z",
                  expires_at: null,
                  is_active: true,
                  qr_code: {
                    id: "660e8400-e29b-41d4-a716-446655440000",
                    qr_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                    created_at: "2024-01-15T10:30:00Z",
                  },
                },
              ],
              count: 1,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/links"),
      },
      {
        method: "POST",
        path: "/api/v1/links",
        title: "Create a new link",
        description: "Create a new shortened link. You can optionally provide a custom short code, title, expiration date, and UTM parameters. If a QR code was previously generated for this link, it will be included in the response.",
        parameters: [
          {
            name: "original_url",
            type: "string",
            required: true,
            description: "The original URL to shorten",
          },
          {
            name: "short_code",
            type: "string",
            required: false,
            description: "Custom short code (2-20 characters, alphanumeric and hyphens only)",
          },
          {
            name: "title",
            type: "string",
            required: false,
            description: "Optional title for the link",
          },
          {
            name: "expires_at",
            type: "string (ISO 8601)",
            required: false,
            description: "Optional expiration date for the link",
          },
          {
            name: "utm_parameters",
            type: "object",
            required: false,
            description: "UTM tracking parameters (source, medium, campaign, term, content)",
          },
          {
            name: "campaign_id",
            type: "string (UUID)",
            required: false,
            description: "Optional campaign ID to associate with this link",
          },
        ],
        requestBody: {
          original_url: "https://example.com",
          title: "My Link",
          short_code: "my-link",
        },
        responses: [
          {
            status: 201,
            description: "Link created successfully",
            body: JSON.stringify({
              id: "550e8400-e29b-41d4-a716-446655440000",
              short_code: "my-link",
              short_url: "https://your-domain.com/my-link",
              original_url: "https://example.com",
              title: "My Link",
              click_count: 0,
              created_at: "2024-01-15T10:30:00Z",
              expires_at: null,
              qr_code: null,
            }, null, 2),
          },
          {
            status: 400,
            description: "Bad request",
            body: JSON.stringify({
              error: "original_url is required",
            }, null, 2),
          },
        ],
        examples: generateExamples("POST", "/api/v1/links", {
          original_url: "https://example.com",
          title: "My Link",
          short_code: "my-link",
        }),
      },
      {
        method: "GET",
        path: "/api/v1/links/{id}",
        title: "Get a specific link",
        description: "Retrieve detailed information about a specific link by its ID. If the link has an associated QR code, it will be included in the qr_code field (null if no QR code exists).",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the link",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              id: "550e8400-e29b-41d4-a716-446655440000",
              short_code: "abc123",
              short_url: "https://your-domain.com/abc123",
              original_url: "https://example.com",
              title: "Example Link",
              click_count: 42,
              created_at: "2024-01-15T10:30:00Z",
              expires_at: null,
              is_active: true,
              utm_parameters: {
                source: "twitter",
                medium: "social",
              },
              campaign_id: null,
              qr_code: {
                id: "660e8400-e29b-41d4-a716-446655440000",
                qr_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                created_at: "2024-01-15T10:30:00Z",
              },
            }, null, 2),
          },
          {
            status: 404,
            description: "Link not found",
            body: JSON.stringify({
              error: "Link not found",
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/links/{id}"),
      },
      {
        method: "PATCH",
        path: "/api/v1/links/{id}",
        title: "Update a link",
        description: "Update an existing link. You can modify the title, expiration date, active status, UTM parameters, or campaign association. If the link has an associated QR code, it will be included in the response.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the link",
          },
        ],
        requestBody: {
          title: "Updated Title",
          is_active: false,
        },
        responses: [
          {
            status: 200,
            description: "Link updated successfully",
            body: JSON.stringify({
              id: "550e8400-e29b-41d4-a716-446655440000",
              short_code: "abc123",
              short_url: "https://your-domain.com/abc123",
              original_url: "https://example.com",
              title: "Updated Title",
              click_count: 42,
              created_at: "2024-01-15T10:30:00Z",
              expires_at: null,
              is_active: false,
              qr_code: {
                id: "660e8400-e29b-41d4-a716-446655440000",
                qr_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                created_at: "2024-01-15T10:30:00Z",
              },
            }, null, 2),
          },
        ],
        examples: generateExamples("PATCH", "/api/v1/links/{id}", {
          title: "Updated Title",
          is_active: false,
        }),
      },
      {
        method: "DELETE",
        path: "/api/v1/links/{id}",
        title: "Delete a link",
        description: "Permanently delete a link. This action cannot be undone.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the link",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Link deleted successfully",
            body: JSON.stringify({
              message: "Link deleted successfully",
            }, null, 2),
          },
        ],
        examples: generateExamples("DELETE", "/api/v1/links/{id}"),
      },
      {
        method: "GET",
        path: "/api/v1/links/{id}/analytics",
        title: "Get link analytics",
        description: "Retrieve comprehensive analytics data for a specific link, including click counts, geographic data, referrers, and time-based statistics.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the link",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              link_id: "550e8400-e29b-41d4-a716-446655440000",
              total_clicks: 1250,
              unique_clicks: 980,
              clicks_by_date: {
                "2024-01-15": 45,
                "2024-01-16": 67,
                "2024-01-17": 89,
              },
              top_referrers: [
                { referrer: "https://twitter.com", count: 320 },
                { referrer: "https://facebook.com", count: 180 },
                { referrer: "Direct", count: 150 },
              ],
              clicks_by_country: [
                { country: "US", count: 450 },
                { country: "GB", count: 230 },
                { country: "CA", count: 120 },
              ],
              recent_clicks: [
                {
                  clicked_at: "2024-01-17T14:30:00Z",
                  referrer: "https://twitter.com",
                  country: "US",
                  user_agent: "Mozilla/5.0...",
                },
              ],
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/links/{id}/analytics"),
      },
    ],
  },
  {
    id: "qr-codes",
    category: "QR Codes",
    icon: QrCode,
    description: "Generate and manage QR codes for your links or custom URLs.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/qr",
        title: "List all QR codes",
        description: "Retrieve a list of all your QR codes. Returns QR codes ordered by creation date (newest first).",
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              qr_codes: [
                {
                  id: "660e8400-e29b-41d4-a716-446655440000",
                  link_id: "550e8400-e29b-41d4-a716-446655440000",
                  qr_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                  created_at: "2024-01-15T10:30:00Z",
                  is_active: true,
                },
              ],
              count: 1,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/qr"),
      },
      {
        method: "POST",
        path: "/api/v1/qr",
        title: "Create a new QR code",
        description: "Generate a new QR code. You can create a QR code for a custom URL or for an existing link by providing its ID.",
        parameters: [
          {
            name: "url",
            type: "string",
            required: false,
            description: "Custom URL to encode in the QR code (required if link_id is not provided)",
          },
          {
            name: "link_id",
            type: "string (UUID)",
            required: false,
            description: "ID of an existing link to create QR code for (required if url is not provided)",
          },
        ],
        requestBody: {
          url: "https://example.com",
        },
        responses: [
          {
            status: 201,
            description: "QR code created successfully",
            body: JSON.stringify({
              id: "660e8400-e29b-41d4-a716-446655440000",
              link_id: null,
              qr_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
              created_at: "2024-01-15T10:30:00Z",
              is_active: true,
            }, null, 2),
          },
          {
            status: 400,
            description: "Bad request",
            body: JSON.stringify({
              error: "link_id or url is required",
            }, null, 2),
          },
        ],
        examples: generateExamples("POST", "/api/v1/qr", {
          url: "https://example.com",
        }),
      },
      {
        method: "GET",
        path: "/api/v1/qr/{id}",
        title: "Get a specific QR code",
        description: "Retrieve detailed information about a specific QR code, including the base64-encoded image data.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the QR code",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              id: "660e8400-e29b-41d4-a716-446655440000",
              link_id: "550e8400-e29b-41d4-a716-446655440000",
              qr_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
              created_at: "2024-01-15T10:30:00Z",
              is_active: true,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/qr/{id}"),
      },
      {
        method: "DELETE",
        path: "/api/v1/qr/{id}",
        title: "Delete a QR code",
        description: "Permanently delete a QR code. This action cannot be undone.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the QR code",
          },
        ],
        responses: [
          {
            status: 200,
            description: "QR code deleted successfully",
            body: JSON.stringify({
              message: "QR code deleted successfully",
            }, null, 2),
          },
        ],
        examples: generateExamples("DELETE", "/api/v1/qr/{id}"),
      },
    ],
  },
  {
    id: "campaigns",
    category: "Campaigns",
    icon: Monitor,
    description: "Organize and track your links with campaigns for better marketing insights.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/campaigns",
        title: "List all campaigns",
        description: "Retrieve a list of all your campaigns with their associated statistics.",
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              campaigns: [
                {
                  id: "770e8400-e29b-41d4-a716-446655440000",
                  name: "Summer Campaign",
                  description: "Summer promotion campaign",
                  start_date: "2024-06-01T00:00:00Z",
                  end_date: "2024-08-31T23:59:59Z",
                  campaign_type: "seasonal_promo",
                  tags: ["summer", "promotion"],
                  target_clicks: 10000,
                  budget: 5000.00,
                  is_active: true,
                  created_at: "2024-05-15T10:30:00Z",
                },
              ],
              count: 1,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/campaigns"),
      },
      {
        method: "POST",
        path: "/api/v1/campaigns",
        title: "Create a new campaign",
        description: "Create a new marketing campaign to organize and track your links.",
        parameters: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Campaign name",
          },
          {
            name: "description",
            type: "string",
            required: false,
            description: "Campaign description",
          },
          {
            name: "start_date",
            type: "string (ISO 8601)",
            required: false,
            description: "Campaign start date",
          },
          {
            name: "end_date",
            type: "string (ISO 8601)",
            required: false,
            description: "Campaign end date",
          },
          {
            name: "campaign_type",
            type: "string",
            required: false,
            description: "Type of campaign (e.g., 'product_launch', 'seasonal_promo', 'email_marketing')",
          },
          {
            name: "tags",
            type: "array of strings",
            required: false,
            description: "Tags for categorizing the campaign",
          },
          {
            name: "target_clicks",
            type: "integer",
            required: false,
            description: "Target number of clicks for the campaign",
          },
          {
            name: "budget",
            type: "number",
            required: false,
            description: "Campaign budget",
          },
        ],
        requestBody: {
          name: "Summer Campaign",
          description: "Summer promotion",
          start_date: "2024-06-01",
          end_date: "2024-08-31",
        },
        responses: [
          {
            status: 201,
            description: "Campaign created successfully",
            body: JSON.stringify({
              id: "770e8400-e29b-41d4-a716-446655440000",
              name: "Summer Campaign",
              description: "Summer promotion",
              start_date: "2024-06-01T00:00:00Z",
              end_date: "2024-08-31T23:59:59Z",
              is_active: true,
              created_at: "2024-05-15T10:30:00Z",
            }, null, 2),
          },
        ],
        examples: generateExamples("POST", "/api/v1/campaigns", {
          name: "Summer Campaign",
          description: "Summer promotion",
          start_date: "2024-06-01",
          end_date: "2024-08-31",
        }),
      },
      {
        method: "GET",
        path: "/api/v1/campaigns/{id}",
        title: "Get a specific campaign",
        description: "Retrieve detailed information about a campaign, including statistics and associated links.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the campaign",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              id: "770e8400-e29b-41d4-a716-446655440000",
              name: "Summer Campaign",
              description: "Summer promotion",
              start_date: "2024-06-01T00:00:00Z",
              end_date: "2024-08-31T23:59:59Z",
              campaign_type: "seasonal_promo",
              tags: ["summer", "promotion"],
              target_clicks: 10000,
              budget: 5000.00,
              is_active: true,
              created_at: "2024-05-15T10:30:00Z",
              total_clicks: 8500,
              total_links: 25,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/campaigns/{id}"),
      },
      {
        method: "PATCH",
        path: "/api/v1/campaigns/{id}",
        title: "Update a campaign",
        description: "Update an existing campaign's details, including status, dates, and metadata.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the campaign",
          },
        ],
        requestBody: {
          is_active: false,
        },
        responses: [
          {
            status: 200,
            description: "Campaign updated successfully",
            body: JSON.stringify({
              id: "770e8400-e29b-41d4-a716-446655440000",
              name: "Summer Campaign",
              is_active: false,
            }, null, 2),
          },
        ],
        examples: generateExamples("PATCH", "/api/v1/campaigns/{id}", {
          is_active: false,
        }),
      },
      {
        method: "DELETE",
        path: "/api/v1/campaigns/{id}",
        title: "Delete a campaign",
        description: "Permanently delete a campaign. This will not delete associated links.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the campaign",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Campaign deleted successfully",
            body: JSON.stringify({
              message: "Campaign deleted successfully",
            }, null, 2),
          },
        ],
        examples: generateExamples("DELETE", "/api/v1/campaigns/{id}"),
      },
    ],
  },
  {
    id: "webhooks",
    category: "Webhooks",
    icon: Radio,
    description: "Receive real-time notifications when events occur in your account.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/webhooks",
        title: "List all webhooks",
        description: "Retrieve a list of all your configured webhooks.",
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              webhooks: [
                {
                  id: "880e8400-e29b-41d4-a716-446655440000",
                  name: "Link Created Webhook",
                  url: "https://your-server.com/webhooks",
                  events: ["link.created", "link.updated"],
                  is_active: true,
                  last_triggered_at: "2024-01-15T14:30:00Z",
                  failure_count: 0,
                  created_at: "2024-01-10T10:00:00Z",
                },
              ],
              count: 1,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/webhooks"),
      },
      {
        method: "POST",
        path: "/api/v1/webhooks",
        title: "Create a new webhook",
        description: "Create a new webhook to receive notifications for specific events. The webhook secret is returned only once upon creation.",
        parameters: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Webhook name for identification",
          },
          {
            name: "url",
            type: "string (URL)",
            required: true,
            description: "The URL where webhook events will be sent",
          },
          {
            name: "events",
            type: "array of strings",
            required: true,
            description: "Array of event types to subscribe to: 'link.created', 'link.updated', 'link.deleted', 'link.clicked'",
          },
        ],
        requestBody: {
          name: "Link Created Webhook",
          url: "https://your-server.com/webhooks",
          events: ["link.created", "link.updated"],
        },
        responses: [
          {
            status: 201,
            description: "Webhook created successfully",
            body: JSON.stringify({
              id: "880e8400-e29b-41d4-a716-446655440000",
              name: "Link Created Webhook",
              url: "https://your-server.com/webhooks",
              events: ["link.created", "link.updated"],
              secret: "whsec_abc123...",
              is_active: true,
              created_at: "2024-01-10T10:00:00Z",
            }, null, 2),
          },
        ],
        examples: generateExamples("POST", "/api/v1/webhooks", {
          name: "Link Created Webhook",
          url: "https://your-server.com/webhooks",
          events: ["link.created", "link.updated"],
        }),
      },
      {
        method: "GET",
        path: "/api/v1/webhooks/{id}",
        title: "Get a specific webhook",
        description: "Retrieve detailed information about a specific webhook. The secret is not included in the response.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the webhook",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              id: "880e8400-e29b-41d4-a716-446655440000",
              name: "Link Created Webhook",
              url: "https://your-server.com/webhooks",
              events: ["link.created", "link.updated"],
              is_active: true,
              last_triggered_at: "2024-01-15T14:30:00Z",
              failure_count: 0,
              created_at: "2024-01-10T10:00:00Z",
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/webhooks/{id}"),
      },
      {
        method: "PATCH",
        path: "/api/v1/webhooks/{id}",
        title: "Update a webhook",
        description: "Update webhook configuration, including URL, events, or active status.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the webhook",
          },
        ],
        requestBody: {
          is_active: false,
        },
        responses: [
          {
            status: 200,
            description: "Webhook updated successfully",
            body: JSON.stringify({
              id: "880e8400-e29b-41d4-a716-446655440000",
              name: "Link Created Webhook",
              is_active: false,
            }, null, 2),
          },
        ],
        examples: generateExamples("PATCH", "/api/v1/webhooks/{id}", {
          is_active: false,
        }),
      },
      {
        method: "DELETE",
        path: "/api/v1/webhooks/{id}",
        title: "Delete a webhook",
        description: "Permanently delete a webhook. This action cannot be undone.",
        parameters: [
          {
            name: "id",
            type: "string (UUID)",
            required: true,
            description: "The unique identifier of the webhook",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Webhook deleted successfully",
            body: JSON.stringify({
              message: "Webhook deleted successfully",
            }, null, 2),
          },
        ],
        examples: generateExamples("DELETE", "/api/v1/webhooks/{id}"),
      },
    ],
  },
  {
    id: "usage",
    category: "Usage Analytics",
    icon: BarChart3,
    description: "Monitor your API usage and track request statistics.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/usage",
        title: "Get API usage statistics",
        description: "Retrieve comprehensive statistics about your API usage, including request counts, success rates, response times, and breakdowns by endpoint and status code.",
        parameters: [
          {
            name: "days",
            type: "integer",
            required: false,
            description: "Number of days to include in statistics (default: 30, max: 90)",
          },
          {
            name: "api_key_id",
            type: "string (UUID)",
            required: false,
            description: "Filter statistics for a specific API key (optional)",
          },
        ],
        responses: [
          {
            status: 200,
            description: "Successful response",
            body: JSON.stringify({
              stats: {
                total_requests: 15420,
                successful_requests: 15080,
                failed_requests: 340,
                average_response_time: 125,
                requests_by_endpoint: {
                  "/api/v1/links": 8500,
                  "/api/v1/qr": 3200,
                  "/api/v1/campaigns": 1800,
                  "/api/v1/webhooks": 1920,
                },
                requests_by_status: {
                  200: 12000,
                  201: 3080,
                  400: 200,
                  404: 100,
                  500: 40,
                },
                requests_by_day: {
                  "2024-01-15": 450,
                  "2024-01-16": 520,
                  "2024-01-17": 480,
                },
              },
              period_days: 30,
            }, null, 2),
          },
        ],
        examples: generateExamples("GET", "/api/v1/usage?days=30"),
      },
    ],
  },
];

export function ApiReferenceClient() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, Language>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("getting-started");
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [webhookTab, setWebhookTab] = useState<"getting-started" | "endpoints">("getting-started");

  const handleCopy = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getSelectedLanguage = (endpointIndex: string): Language => {
    return selectedLanguages[endpointIndex] || "curl";
  };

  const setSelectedLanguage = (endpointIndex: string, language: Language) => {
    setSelectedLanguages((prev) => ({ ...prev, [endpointIndex]: language }));
  };

  const toggleEndpoint = (endpointId: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(endpointId)) {
        next.delete(endpointId);
      } else {
        next.add(endpointId);
      }
      return next;
    });
  };

  const currentCategory = apiCategories.find((cat) => cat.id === selectedCategory) || apiCategories[0];

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="border-b border-neutral-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center shadow-button">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-neutral-text">lunr.to</span>
              <span className="text-sm text-neutral-muted">API Reference</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/docs"
                className="text-sm font-medium text-neutral-muted hover:text-electric-sapphire transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/login"
                className={cn(
                  "px-5 py-2.5 rounded-xl font-semibold text-white text-sm",
                  "bg-gradient-to-r from-electric-sapphire to-bright-indigo",
                  "hover:from-bright-indigo hover:to-vivid-royal",
                  "transition-all active:scale-[0.98] shadow-button"
                )}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Authentication Section */}
              <div className="bg-white rounded-xl p-4 border border-neutral-border shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="h-4 w-4 text-electric-sapphire" />
                  <h3 className="font-semibold text-sm text-neutral-text">Authentication</h3>
                </div>
                <p className="text-xs text-neutral-muted mb-3">
                  All requests require an API key in the Authorization header.
                </p>
                <div className="relative">
                  <pre className="bg-neutral-bg border border-neutral-border p-2 rounded text-xs overflow-x-auto">
                    <code className="text-neutral-text font-mono">Bearer sk_...</code>
                  </pre>
                  <button
                    onClick={() => handleCopy("Authorization: Bearer sk_your_api_key_here", "auth-header")}
                    className="absolute top-1 right-1 p-1 text-neutral-muted hover:text-neutral-text"
                  >
                    {copiedIndex === "auth-header" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Category Navigation */}
              <nav className="space-y-1">
                <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wider px-3 mb-2">
                  API Sections
                </div>
                {apiCategories
                  .filter((category) => category.id !== "webhooks")
                  .map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire border border-electric-sapphire/20"
                            : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-left">{category.category}</span>
                      </button>
                    );
                  })}
                
                {/* Webhooks Main Category */}
                <div className="mt-4 pt-4 border-t border-neutral-border">
                  <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wider px-3 mb-2">
                    Webhooks
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory("webhooks");
                        setWebhookTab("getting-started");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                        selectedCategory === "webhooks" && webhookTab === "getting-started"
                          ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire border border-electric-sapphire/20"
                          : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
                      )}
                    >
                      <Code className="h-4 w-4 flex-shrink-0" />
                      <span>Getting Started</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory("webhooks");
                        setWebhookTab("endpoints");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                        selectedCategory === "webhooks" && webhookTab === "endpoints"
                          ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire border border-electric-sapphire/20"
                          : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
                      )}
                    >
                      <Radio className="h-4 w-4 flex-shrink-0" />
                      <span>Endpoints</span>
                    </button>
                  </div>
                </div>
              </nav>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-electric-sapphire/5 to-bright-indigo/5 rounded-xl p-4 border border-electric-sapphire/20">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-electric-sapphire" />
                  <h3 className="font-semibold text-sm text-neutral-text">Resources</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <Link href="/docs" className="block text-electric-sapphire hover:underline">
                    Full Documentation
                  </Link>
                  <Link href="/dashboard/settings" className="block text-electric-sapphire hover:underline">
                    Manage API Keys
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Getting Started Content */}
            {selectedCategory === "getting-started" ? (
              <div className="bg-white rounded-xl border border-neutral-border shadow-soft p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                    <Code className="h-5 w-5 text-electric-sapphire" />
                  </div>
                  <h1 className="text-3xl font-bold text-neutral-text">Getting Started</h1>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-text mb-3">1. Create an API Key</h2>
                    <p className="text-sm text-neutral-muted mb-3">
                      API access is available on Enterprise plans. Go to <Link href="/dashboard/settings" className="text-electric-sapphire hover:underline font-medium">Settings → API Keys</Link> to create your first API key.
                    </p>
                    <p className="text-xs text-neutral-muted">
                      <strong>Important:</strong> Save your API key securely when created - you won't be able to see it again!
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-neutral-text mb-3">2. Authenticate Requests</h2>
                    <p className="text-sm text-neutral-muted mb-3">
                      Include your API key in the Authorization header of all requests:
                    </p>
                    <div className="relative bg-neutral-bg border border-neutral-border rounded-lg p-3">
                      <pre className="text-xs font-mono text-neutral-text overflow-x-auto">
                        <code>Authorization: Bearer sk_your_api_key_here</code>
                      </pre>
                      <button
                        onClick={() => handleCopy("Authorization: Bearer sk_your_api_key_here", "getting-started-auth")}
                        className="absolute top-2 right-2 p-1.5 text-neutral-muted hover:text-neutral-text rounded transition-colors"
                      >
                        {copiedIndex === "getting-started-auth" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-muted mt-2">
                      Alternatively, you can use: <code className="bg-neutral-bg px-1.5 py-0.5 rounded text-xs">Authorization: ApiKey sk_your_api_key_here</code>
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-neutral-text mb-3">3. Base URL</h2>
                    <p className="text-sm text-neutral-muted mb-3">
                      All API endpoints are available at:
                    </p>
                    <div className="relative bg-neutral-bg border border-neutral-border rounded-lg p-3">
                      <pre className="text-xs font-mono text-neutral-text overflow-x-auto">
                        <code>https://your-domain.com/api/v1</code>
                      </pre>
                      <button
                        onClick={() => handleCopy("https://your-domain.com/api/v1", "getting-started-baseurl")}
                        className="absolute top-2 right-2 p-1.5 text-neutral-muted hover:text-neutral-text rounded transition-colors"
                      >
                        {copiedIndex === "getting-started-baseurl" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-neutral-text mb-3">4. Make Your First Request</h2>
                    <p className="text-sm text-neutral-muted mb-3">
                      Try listing your links to get started:
                    </p>
                    <div className="relative bg-neutral-bg border border-neutral-border rounded-lg p-3">
                      <pre className="text-xs font-mono text-neutral-text overflow-x-auto whitespace-pre">
                        <code>{`curl -X GET https://your-domain.com/api/v1/links \\
  -H "Authorization: Bearer sk_your_api_key_here"`}</code>
                      </pre>
                      <button
                        onClick={() => handleCopy('curl -X GET https://your-domain.com/api/v1/links \\\n  -H "Authorization: Bearer sk_your_api_key_here"', "getting-started-curl")}
                        className="absolute top-2 right-2 p-1.5 text-neutral-muted hover:text-neutral-text rounded transition-colors"
                      >
                        {copiedIndex === "getting-started-curl" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-border">
                    <h2 className="text-xl font-semibold text-neutral-text mb-3">Rate Limits</h2>
                    <p className="text-sm text-neutral-muted">
                      Enterprise plans include <strong className="text-neutral-text">10,000 requests per hour</strong> per API key. Rate limit headers are included in all responses.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-border">
                    <h2 className="text-xl font-semibold text-neutral-text mb-3">Response Format</h2>
                    <p className="text-sm text-neutral-muted mb-2">
                      All responses are in JSON format. Successful responses return status codes 200-299. Error responses include an <code className="bg-neutral-bg px-1.5 py-0.5 rounded text-xs">error</code> field with a descriptive message.
                    </p>
                  </div>
                </div>
              </div>
            ) : selectedCategory === "webhooks" ? (
              <>
                {/* Webhooks Category Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                      <Radio className="h-5 w-5 text-electric-sapphire" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-neutral-text">Webhooks</h1>
                      <p className="text-neutral-muted mt-1">Receive real-time notifications when events occur in your account.</p>
                    </div>
                  </div>

                  {/* Webhook Tabs */}
                  <div className="flex gap-2 border-b border-neutral-border">
                    <button
                      onClick={() => setWebhookTab("getting-started")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                        webhookTab === "getting-started"
                          ? "text-electric-sapphire border-electric-sapphire"
                          : "text-neutral-muted border-transparent hover:text-neutral-text"
                      )}
                    >
                      Getting Started
                    </button>
                    <button
                      onClick={() => setWebhookTab("endpoints")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                        webhookTab === "endpoints"
                          ? "text-electric-sapphire border-electric-sapphire"
                          : "text-neutral-muted border-transparent hover:text-neutral-text"
                      )}
                    >
                      Endpoints
                    </button>
                  </div>
                </div>

                {/* Webhooks Getting Started Tab */}
                {webhookTab === "getting-started" && (
                  <div className="bg-white rounded-xl border border-neutral-border shadow-soft p-8">
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">What are Webhooks?</h2>
                        <p className="text-sm text-neutral-muted leading-relaxed">
                          Webhooks allow you to receive real-time notifications when events occur in your account. Instead of polling the API, 
                          your server will automatically receive POST requests when links are created, updated, deleted, or clicked.
                        </p>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">Step 1: Create a Webhook Endpoint</h2>
                        <p className="text-sm text-neutral-muted mb-3">
                          Set up an HTTP endpoint on your server that can receive POST requests. This endpoint should:
                        </p>
                        <ul className="list-disc list-inside text-sm text-neutral-muted space-y-1.5 ml-4 mb-4">
                          <li>Accept POST requests with JSON payloads</li>
                          <li>Return a 2xx status code within 5 seconds</li>
                          <li>Use HTTPS for security (required for production)</li>
                          <li>Verify webhook signatures to ensure authenticity</li>
                          <li>Implement idempotency to handle duplicate events</li>
                        </ul>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">Step 2: Create a Webhook</h2>
                        <p className="text-sm text-neutral-muted mb-3">
                          Use the <code className="bg-neutral-bg px-1.5 py-0.5 rounded text-xs font-mono">POST /api/v1/webhooks</code> endpoint to register your webhook:
                        </p>
                        <CodeEditor
                          code={`curl -X POST https://your-domain.com/api/v1/webhooks \\
  -H "Authorization: Bearer sk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Link Created Webhook",
    "url": "https://your-server.com/webhooks",
    "events": ["link.created", "link.updated"]
  }'`}
                          language="bash"
                        />
                        <p className="text-xs text-neutral-muted mt-2">
                          <strong>Important:</strong> Save the webhook secret returned in the response - you'll need it to verify signatures!
                        </p>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">Step 3: Verify Webhook Signatures</h2>
                        <p className="text-sm text-neutral-muted mb-3">
                          Always verify webhook signatures to ensure requests are authentic. Webhooks include an 
                          <code className="bg-neutral-bg px-1.5 py-0.5 rounded text-xs font-mono"> X-Webhook-Signature</code> header containing an HMAC SHA256 signature.
                        </p>
                        
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-neutral-text mb-2">JavaScript/Node.js Example</h3>
                          <CodeEditor
                            code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}

// In your Express.js webhook handler
app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const isValid = verifyWebhook(payload, signature, webhookSecret);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook event
  const event = req.headers['x-webhook-event'];
  // ... handle the event
  
  res.status(200).json({ received: true });
});`}
                            language="javascript"
                          />
                        </div>

                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-neutral-text mb-2">Python Example</h3>
                          <CodeEditor
                            code={`import hmac
import hashlib
import json

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

# In your Flask webhook handler
@app.route('/webhooks', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = json.dumps(request.json)
    
    if not verify_webhook(payload, signature, webhook_secret):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.headers.get('X-Webhook-Event')
    # ... handle the event
    
    return jsonify({'received': True}), 200`}
                            language="python"
                          />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">Supported Events</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-text mb-2">Link Events</h3>
                            <div className="space-y-2">
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">link.created</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a link is created</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">link.updated</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a link is updated</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">link.deleted</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a link is deleted</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">link.clicked</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a link is clicked</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-text mb-2">QR Code Events</h3>
                            <div className="space-y-2">
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">qr.created</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a QR code is created</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">qr.updated</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a QR code is updated</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">qr.deleted</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a QR code is deleted</p>
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-text mb-2 mt-4">Page Events</h3>
                            <div className="space-y-2">
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">page.created</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a page is created</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">page.updated</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a page is updated</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">page.deleted</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a page is deleted</p>
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-text mb-2 mt-4">Campaign Events</h3>
                            <div className="space-y-2">
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">campaign.created</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a campaign is created</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">campaign.updated</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a campaign is updated</p>
                              </div>
                              <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                                <code className="text-sm font-mono text-electric-sapphire">campaign.deleted</code>
                                <p className="text-xs text-neutral-muted mt-1">Triggered when a campaign is deleted</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-neutral-border">
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">Webhook Request Format</h2>
                        <p className="text-sm text-neutral-muted mb-3">
                          Each webhook request includes these headers and a JSON body:
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                            <code className="text-sm font-mono text-electric-sapphire">X-Webhook-Event</code>
                            <p className="text-xs text-neutral-muted mt-1">The event type (e.g., "link.created", "link.clicked")</p>
                          </div>
                          <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                            <code className="text-sm font-mono text-electric-sapphire">X-Webhook-Signature</code>
                            <p className="text-xs text-neutral-muted mt-1">HMAC SHA256 signature for verification (hex encoded)</p>
                          </div>
                          <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                            <code className="text-sm font-mono text-electric-sapphire">X-Webhook-Id</code>
                            <p className="text-xs text-neutral-muted mt-1">The unique webhook ID that triggered this event</p>
                          </div>
                          <div className="bg-neutral-bg border border-neutral-border rounded-lg p-3">
                            <code className="text-sm font-mono text-electric-sapphire">Content-Type</code>
                            <p className="text-xs text-neutral-muted mt-1">Always "application/json"</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-text mb-2">Example Request Body (link.created event)</h3>
                          <CodeEditor
                            code={JSON.stringify({
                              id: "550e8400-e29b-41d4-a716-446655440000",
                              short_code: "abc123",
                              short_url: "https://your-domain.com/abc123",
                              original_url: "https://example.com",
                              title: "Example Link",
                              click_count: 0,
                              created_at: "2024-01-15T10:30:00Z",
                            }, null, 2)}
                            language="json"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-neutral-border">
                        <h2 className="text-xl font-semibold text-neutral-text mb-3">Best Practices</h2>
                        <div className="space-y-2 text-sm text-neutral-muted">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-neutral-text">Always verify signatures</strong> - Never process webhooks without signature verification
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-neutral-text">Use HTTPS</strong> - Webhook URLs must use HTTPS in production
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-neutral-text">Respond quickly</strong> - Return a 2xx status code within 5 seconds
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-neutral-text">Implement idempotency</strong> - Use event IDs to prevent duplicate processing
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-neutral-text">Monitor failures</strong> - Set up alerts for webhook failures and retry logic
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhooks Endpoints Tab */}
                {webhookTab === "endpoints" && (
                  <div className="space-y-6">
                    {(() => {
                      const webhookCategory = apiCategories.find((cat) => cat.id === "webhooks");
                      if (!webhookCategory) return null;
                      
                      return webhookCategory.endpoints.map((endpoint, idx) => {
                        const endpointId = `webhooks-${idx}`;
                        const isExpanded = expandedEndpoints.has(endpointId);
                        const selectedLang = getSelectedLanguage(endpointId);
                        const currentExample = endpoint.examples.find((e) => e.language === selectedLang) || endpoint.examples[0];

                        return (
                          <div
                            key={endpointId}
                            className="bg-white rounded-xl border border-neutral-border shadow-soft overflow-hidden"
                          >
                            {/* Endpoint Header */}
                            <div
                              className="p-6 cursor-pointer hover:bg-neutral-bg/50 transition-colors"
                              onClick={() => toggleEndpoint(endpointId)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span
                                      className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-semibold",
                                        endpoint.method === "GET" && "bg-blue-100 text-blue-800",
                                        endpoint.method === "POST" && "bg-green-100 text-green-800",
                                        endpoint.method === "PATCH" && "bg-yellow-100 text-yellow-800",
                                        endpoint.method === "DELETE" && "bg-red-100 text-red-800"
                                      )}
                                    >
                                      {endpoint.method}
                                    </span>
                                    <code className="text-sm font-mono text-neutral-text font-semibold">{endpoint.path}</code>
                                  </div>
                                  <h3 className="text-lg font-semibold text-neutral-text mb-2">{endpoint.title}</h3>
                                  <p className="text-sm text-neutral-muted leading-relaxed">{endpoint.description}</p>
                                </div>
                                <ChevronRight
                                  className={cn(
                                    "h-5 w-5 text-neutral-muted flex-shrink-0 transition-transform",
                                    isExpanded && "transform rotate-90"
                                  )}
                                />
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="border-t border-neutral-border p-6 space-y-6 bg-neutral-bg/30">
                                {/* Parameters */}
                                {endpoint.parameters && endpoint.parameters.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-neutral-text mb-3">Parameters</h4>
                                    <div className="space-y-2">
                                      {endpoint.parameters.map((param, paramIdx) => (
                                        <div key={paramIdx} className="bg-white rounded-lg p-3 border border-neutral-border">
                                          <div className="flex items-start justify-between gap-4 mb-1">
                                            <div className="flex items-center gap-2">
                                              <code className="text-sm font-mono font-semibold text-neutral-text">{param.name}</code>
                                              <span className="text-xs text-neutral-muted">({param.type})</span>
                                              {param.required && (
                                                <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                                  Required
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-xs text-neutral-muted">{param.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Request Body */}
                                {endpoint.requestBody && Object.keys(endpoint.requestBody).length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-neutral-text mb-3">Request Body</h4>
                                    <CodeEditor
                                      code={JSON.stringify(endpoint.requestBody, null, 2)}
                                      language="json"
                                    />
                                  </div>
                                )}

                                {/* Code Examples */}
                                <div>
                                  <h4 className="text-sm font-semibold text-neutral-text mb-3">Code Examples</h4>
                                  <div className="flex gap-2 mb-3 border-b border-neutral-border">
                                    {endpoint.examples.map((example) => (
                                      <button
                                        key={example.language}
                                        onClick={() => setSelectedLanguage(endpointId, example.language)}
                                        className={cn(
                                          "px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                                          selectedLang === example.language
                                            ? "text-electric-sapphire border-electric-sapphire"
                                            : "text-neutral-muted border-transparent hover:text-neutral-text"
                                        )}
                                      >
                                        {example.label}
                                      </button>
                                    ))}
                                  </div>
                                  <CodeEditor
                                    code={currentExample.code}
                                    language={currentExample.language === "curl" ? "bash" : currentExample.language}
                                  />
                                </div>

                                {/* Responses */}
                                <div>
                                  <h4 className="text-sm font-semibold text-neutral-text mb-3">Responses</h4>
                                  <div className="space-y-4">
                                    {endpoint.responses.map((response, respIdx) => (
                                      <div key={respIdx} className="bg-white rounded-lg p-4 border border-neutral-border">
                                        <div className="flex items-center gap-2 mb-3">
                                          <span
                                            className={cn(
                                              "px-2.5 py-1 rounded-lg text-xs font-semibold",
                                              response.status >= 200 && response.status < 300 && "bg-green-100 text-green-800",
                                              response.status >= 400 && response.status < 500 && "bg-yellow-100 text-yellow-800",
                                              response.status >= 500 && "bg-red-100 text-red-800"
                                            )}
                                          >
                                            {response.status}
                                          </span>
                                          <span className="text-xs text-neutral-muted">{response.description}</span>
                                        </div>
                                        <CodeEditor
                                          code={response.body}
                                          language="json"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Category Header */}
                <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                {(() => {
                  const Icon = currentCategory.icon;
                  return (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-electric-sapphire" />
                    </div>
                  );
                })()}
                <div>
                  <h1 className="text-3xl font-bold text-neutral-text">{currentCategory.category}</h1>
                  <p className="text-neutral-muted mt-1">{currentCategory.description}</p>
                </div>
              </div>
            </div>

                {/* Endpoints */}
                <div className="space-y-6">
              {currentCategory.endpoints.map((endpoint, idx) => {
                const endpointId = `${currentCategory.id}-${idx}`;
                const isExpanded = expandedEndpoints.has(endpointId);
                const selectedLang = getSelectedLanguage(endpointId);
                const currentExample = endpoint.examples.find((e) => e.language === selectedLang) || endpoint.examples[0];

                return (
                  <div
                    key={endpointId}
                    className="bg-white rounded-xl border border-neutral-border shadow-soft overflow-hidden"
                  >
                    {/* Endpoint Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-neutral-bg/50 transition-colors"
                      onClick={() => toggleEndpoint(endpointId)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={cn(
                                "px-3 py-1 rounded-lg text-xs font-semibold",
                                endpoint.method === "GET" && "bg-blue-100 text-blue-800",
                                endpoint.method === "POST" && "bg-green-100 text-green-800",
                                endpoint.method === "PATCH" && "bg-yellow-100 text-yellow-800",
                                endpoint.method === "DELETE" && "bg-red-100 text-red-800"
                              )}
                            >
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-neutral-text font-semibold">{endpoint.path}</code>
                          </div>
                          <h3 className="text-lg font-semibold text-neutral-text mb-2">{endpoint.title}</h3>
                          <p className="text-sm text-neutral-muted leading-relaxed">{endpoint.description}</p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-5 w-5 text-neutral-muted flex-shrink-0 transition-transform",
                            isExpanded && "transform rotate-90"
                          )}
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-neutral-border p-6 space-y-6 bg-neutral-bg/30">
                        {/* Parameters */}
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-neutral-text mb-3">Parameters</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param, paramIdx) => (
                                <div key={paramIdx} className="bg-white rounded-lg p-3 border border-neutral-border">
                                  <div className="flex items-start gap-2 mb-1">
                                    <code className="text-sm font-mono text-electric-sapphire font-semibold">
                                      {param.name}
                                    </code>
                                    <span className="text-xs text-neutral-muted">({param.type})</span>
                                    {param.required && (
                                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Required</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-neutral-muted">{param.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {endpoint.requestBody && (
                          <div>
                            <h4 className="text-sm font-semibold text-neutral-text mb-3">Request Body</h4>
                            <CodeEditor
                              code={JSON.stringify(endpoint.requestBody, null, 2)}
                              language="json"
                            />
                          </div>
                        )}

                        {/* Code Examples */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-neutral-text">Code Examples</h4>
                            <div className="flex gap-2">
                              {endpoint.examples.map((example) => (
                                <button
                                  key={example.language}
                                  onClick={() => setSelectedLanguage(endpointId, example.language)}
                                  className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                                    selectedLang === example.language
                                      ? "bg-electric-sapphire text-white"
                                      : "bg-white border border-neutral-border text-neutral-muted hover:text-neutral-text"
                                  )}
                                >
                                  {example.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <CodeEditor
                            code={currentExample.code}
                            language={currentExample.language}
                          />
                        </div>

                        {/* Responses */}
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-text mb-3">Responses</h4>
                          <div className="space-y-4">
                            {endpoint.responses.map((response, respIdx) => (
                              <div key={respIdx} className="bg-white rounded-lg border border-neutral-border overflow-hidden">
                                <div className="bg-neutral-bg px-4 py-2 border-b border-neutral-border flex items-center gap-3">
                                  <span
                                    className={cn(
                                      "px-2 py-1 rounded text-xs font-semibold",
                                      response.status >= 200 && response.status < 300 && "bg-green-100 text-green-800",
                                      response.status >= 400 && response.status < 500 && "bg-yellow-100 text-yellow-800",
                                      response.status >= 500 && "bg-red-100 text-red-800"
                                    )}
                                  >
                                    {response.status}
                                  </span>
                                  <span className="text-xs text-neutral-muted">{response.description}</span>
                                </div>
                                <CodeEditor
                                  code={response.body}
                                  language="json"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
