// Database Types
export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  campaign_type: string | null;
  tags: string[] | null;
  target_clicks: number;
  budget: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithStats extends Campaign {
  total_links: number;
  total_clicks: number;
  unique_clicks: number;
}

export interface CreateCampaignInput {
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  campaign_type?: string | null;
  tags?: string[] | null;
  target_clicks?: number;
  budget?: number;
  user_id: string;
}

export interface Link {
  id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  created_at: string;
  expires_at: string | null;
  user_id: string | null;
  campaign_id: string | null;
  is_active: boolean;
  click_count: number;
  password_hash: string | null;
  utm_parameters: Record<string, string> | null;
}

export interface Analytics {
  id: string;
  link_id: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
}

export interface QRCode {
  id: string;
  user_id: string | null;
  link_id: string | null;
  qr_data: string;
  created_at: string;
  is_active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_links: number; // -1 for unlimited
  max_qr_codes: number; // -1 for unlimited
  max_pages: number; // -1 for unlimited
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  plan_id: string | null;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  usage_links: number;
  usage_qr_codes: number;
  usage_pages: number;
  usage_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithPlan extends Profile {
  plan: Plan | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "expired" | "trial";
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  billing_cycle: "monthly" | "yearly" | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan | null;
}

export interface CreateLinkInput {
  original_url: string;
  short_code?: string;
  title?: string | null;
  expires_at?: string | null;
  password?: string | null;
  user_id?: string | null;
  utm_parameters?: Record<string, string> | null;
  campaign_id?: string | null;
}

export interface LinkStats {
  total_clicks: number;
  unique_clicks: number;
  clicks_by_date: Array<{ date: string; count: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
  clicks_by_country: Array<{ country: string; count: number }>;
  utm_sources?: Array<{ source: string; count: number }>;
  utm_mediums?: Array<{ medium: string; count: number }>;
  utm_campaigns?: Array<{ campaign: string; count: number }>;
}

export interface Page {
  id: string;
  user_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  content: Record<string, any>;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  links: Array<any>;
  social_links: Record<string, any>;
  view_count: number;
  click_count: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePageInput {
  slug: string;
  title: string;
  description?: string | null;
  content?: Record<string, any>;
  background_color?: string;
  text_color?: string;
  button_color?: string;
  button_text_color?: string;
  links?: Array<any>;
  social_links?: Record<string, any>;
  is_public?: boolean;
}

export interface UsageLimits {
  max_links: number;
  max_qr_codes: number;
  max_pages: number;
  used_links: number;
  used_qr_codes: number;
  used_pages: number;
  remaining_links: number;
  remaining_qr_codes: number;
  remaining_pages: number;
  can_create_link: boolean;
  can_create_qr: boolean;
  can_create_page: boolean;
}
