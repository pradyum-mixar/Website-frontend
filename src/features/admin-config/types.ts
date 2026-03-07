// ─── Feature Credit Costs ───
export type FeatureCreditCost = {
  feature_key: string;
  credits: number;
  label?: string;
};

// ─── Agent Model Configs ───
export type AgentModelConfig = {
  id: string;
  config_name: string;
  provider: string;
  model_name: string;
  temperature?: number;
  max_tokens?: number;
  description?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

// ─── Agent Role Assignments ───
export type AgentRoleAssignment = {
  role: string;
  slot: string;
  config_id: string;
  config_name?: string;
};

// ─── Generation Model Configs ───
export type GenerationModelConfig = {
  id: string;
  model_key: string;
  provider: string;
  model_name: string;
  display_name: string;
  supports_image: boolean;
  supports_video: boolean;
  default_params?: Record<string, unknown>;
  enabled: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

// ─── Generation Style Presets ───
export type GenerationStylePreset = {
  id: string;
  style_key: string;
  display_name: string;
  prompt_modifier: string;
  thumbnail_url?: string;
  enabled: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

// ─── Generation Feature Flags ───
export type GenerationFeatureFlag = {
  id: string;
  flag_key: string;
  enabled: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

// ─── Subscription Plans ───
export type AdminPlan = {
  slug: string;
  name: string;
  tagline: string;
  price_monthly_cents: number;
  price_yearly_cents: number;
  currency: string;
  credits_per_month: number;
  features: string[];
  highlight: boolean;
  cta_label: string;
  dodo_product_id?: string;
  enabled: boolean;
  sort_order: number;
};

// ─── Credit Pricing ───
export type AdminCreditPricing = {
  slug: string;
  price_per_credit_cents: number;
  currency: string;
  min_quantity: number;
  max_quantity: number;
  dodo_product_id?: string;
  enabled: boolean;
};

// ─── Admin API Response wrapper ───
export type AdminResponse<T> = {
  status: string;
  data: T;
};

// ─── Admin Scripts ───
export type SeedAgentConfigsPayload = {
  force?: boolean;
};

export type IngestDocsPayload = {
  docs_directory: string;
};

export type CleanupCheckpointsPayload = {
  retention_days?: number;
  batch_size?: number;
  vacuum?: boolean;
  dry_run?: boolean;
};

// ─── Form field config for generic form modal ───
export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea" | "json";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  readOnlyOnEdit?: boolean;
};

// ─── Column config for generic table ───
export type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};
