import { useSearchParams } from "react-router-dom";
import { FeatureCreditCostsSection } from "../../features/admin-config/sections/FeatureCreditCostsSection";
import { AgentModelConfigsSection } from "../../features/admin-config/sections/AgentModelConfigsSection";
import { AgentRoleAssignmentsSection } from "../../features/admin-config/sections/AgentRoleAssignmentsSection";
import { GenerationModelConfigsSection } from "../../features/admin-config/sections/GenerationModelConfigsSection";
import { GenerationStylePresetsSection } from "../../features/admin-config/sections/GenerationStylePresetsSection";
import { GenerationFeatureFlagsSection } from "../../features/admin-config/sections/GenerationFeatureFlagsSection";
import { SubscriptionPlansSection } from "../../features/admin-config/sections/SubscriptionPlansSection";
import { CreditPricingSection } from "../../features/admin-config/sections/CreditPricingSection";
import { AdminScriptsSection } from "../../features/admin-config/sections/AdminScriptsSection";
import "../../assets/css/admin-config.css";
import "../../assets/css/admin.css";

type Tab =
  | "credit-costs"
  | "agent-models"
  | "role-assignments"
  | "gen-models"
  | "style-presets"
  | "feature-flags"
  | "plans"
  | "credit-pricing"
  | "scripts";

const TABS: { group: string; items: { key: Tab; label: string }[] }[] = [
  {
    group: "Agent",
    items: [
      { key: "credit-costs", label: "Credit Costs" },
      { key: "agent-models", label: "Agent Models" },
      { key: "role-assignments", label: "Role Assignments" },
    ],
  },
  {
    group: "Generation",
    items: [
      { key: "gen-models", label: "Gen Models" },
      { key: "style-presets", label: "Style Presets" },
      { key: "feature-flags", label: "Feature Flags" },
    ],
  },
  {
    group: "Plans",
    items: [
      { key: "plans", label: "Plans" },
      { key: "credit-pricing", label: "Credit Pricing" },
    ],
  },
  {
    group: "System",
    items: [
      { key: "scripts", label: "Scripts" },
    ],
  },
];

const SECTION_MAP: Record<Tab, () => JSX.Element> = {
  "credit-costs": FeatureCreditCostsSection,
  "agent-models": AgentModelConfigsSection,
  "role-assignments": AgentRoleAssignmentsSection,
  "gen-models": GenerationModelConfigsSection,
  "style-presets": GenerationStylePresetsSection,
  "feature-flags": GenerationFeatureFlagsSection,
  "plans": SubscriptionPlansSection,
  "credit-pricing": CreditPricingSection,
  "scripts": AdminScriptsSection,
};

export function AdminConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "credit-costs";
  const setTab = (tab: Tab) => setSearchParams({ tab }, { replace: true });

  const ActiveSection = SECTION_MAP[activeTab] ?? FeatureCreditCostsSection;

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">System Configuration</h1>
        <p className="dashboard-subtitle">Manage agent configs, generation settings, plans, and admin scripts</p>
      </div>

      <div className="config-tabs">
        {TABS.map((group, gi) => (
          <div key={group.group} style={{ display: "contents" }}>
            {gi > 0 && <div className="config-tab-divider" />}
            {group.items.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`config-tab ${activeTab === item.key ? "active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <ActiveSection />
    </>
  );
}
