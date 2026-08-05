"use client";

import { useState } from "react";
import { User, Key, Radio, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SettingsForm } from "./settings-form";
import { PasswordResetForm } from "./password-reset-form";
import { ApiKeys } from "@/components/api-keys";
import { Webhooks } from "@/components/webhooks";
import { Badge } from "@/components/ui/badge";

interface SettingsClientProps {
  userId: string;
  hasApiAccess: boolean;
  user: {
    id: string;
    email?: string | null;
    user_metadata?: any;
  };
}

type SettingsSection = "profile" | "security" | "api-keys" | "webhooks";

const settingsSections: Array<{
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}> = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your profile information",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Password and security settings",
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: Key,
    description: "Manage your API keys",
  },
  {
    id: "webhooks",
    label: "Webhooks",
    icon: Radio,
    description: "Configure webhook endpoints",
  },
];

function SettingsPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-card border border-neutral-border/80 bg-white shadow-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "radial-gradient(80% 100% at 0% 0%, rgba(67,97,238,0.06), transparent 60%)",
        }}
      />
      <div className="relative p-5 sm:p-7">
        <div className="mb-6 max-w-xl">
          <h2 className="text-lg font-semibold text-neutral-text tracking-tight">{title}</h2>
          <p className="text-sm text-neutral-muted mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="max-w-xl">{children}</div>
      </div>
    </div>
  );
}

export function SettingsClient({ userId, hasApiAccess, user }: SettingsClientProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <SettingsPanel title="Profile" description="Update your account details">
            <SettingsForm user={user} />
          </SettingsPanel>
        );
      case "security":
        return (
          <SettingsPanel title="Security" description="Password and account security">
            <PasswordResetForm />
          </SettingsPanel>
        );
      case "api-keys":
        return <ApiKeys userId={userId} hasApiAccess={hasApiAccess} />;
      case "webhooks":
        return <Webhooks userId={userId} hasApiAccess={hasApiAccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-5">
      <aside className="md:w-52 shrink-0">
        <div className="bg-white/80 backdrop-blur-xl rounded-card border border-neutral-border/80 shadow-soft p-2 sticky top-24">
          <nav className="space-y-0.5">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isDisabled =
                (section.id === "api-keys" || section.id === "webhooks") && !hasApiAccess;

              return (
                <button
                  key={section.id}
                  onClick={() => !isDisabled && setActiveSection(section.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm text-left transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-soft"
                      : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-surface/80 font-medium",
                    isDisabled && "opacity-45 cursor-not-allowed"
                  )}
                  title={isDisabled ? "Enterprise plan required" : section.description}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-primary" : "")} />
                  <span className="flex-1 min-w-0">{section.label}</span>
                  {isDisabled && <Badge variant="default">Pro</Badge>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0">{renderSection()}</div>
    </div>
  );
}
