"use client";

import { useState } from "react";
import { User, Key, Radio, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SettingsForm } from "./settings-form";
import { PasswordResetForm } from "./password-reset-form";
import { ApiKeys } from "@/components/api-keys";
import { Webhooks } from "@/components/webhooks";

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

export function SettingsClient({ userId, hasApiAccess, user }: SettingsClientProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                <User className="h-5 w-5 text-electric-sapphire" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-text">Profile Information</h2>
                <p className="text-sm text-neutral-muted">Update your profile details</p>
              </div>
            </div>
            <SettingsForm user={user} />
          </div>
        );
      case "security":
        return (
          <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-energy/10 to-sky-aqua/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-energy" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-text">Password & Security</h2>
                <p className="text-sm text-neutral-muted">Change your password and manage security settings</p>
              </div>
            </div>
            <PasswordResetForm />
          </div>
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
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3">
        <div className="bg-white rounded-card shadow-soft border border-neutral-border p-4 sticky top-24">
          <h3 className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-4 px-2">
            Settings
          </h3>
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isDisabled = (section.id === "api-keys" || section.id === "webhooks") && !hasApiAccess;

              return (
                <button
                  key={section.id}
                  onClick={() => !isDisabled && setActiveSection(section.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                    isActive
                      ? "bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 text-electric-sapphire border border-electric-sapphire/20"
                      : "text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  title={isDisabled ? "Enterprise plan required" : section.description}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{section.label}</div>
                    {isDisabled && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="h-3 w-3 text-neon-pink" />
                        <span className="text-xs text-neon-pink">Enterprise</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-9">
        {renderSection()}
      </main>
    </div>
  );
}

