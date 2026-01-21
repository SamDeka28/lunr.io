"use client";

import { Link2, QrCode, BarChart3, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export function GettingStartedCard({
  progress,
  hasCreatedLink,
  hasCreatedQR,
  linkCount,
  qrCount,
}: {
  progress: number;
  hasCreatedLink: boolean;
  hasCreatedQR: boolean;
  linkCount: number;
  qrCount: number;
}) {
  const steps = [
    {
      id: 1,
      title: "Make a Link",
      completed: hasCreatedLink,
      action: { label: "Create a link", href: "/dashboard/links/new", icon: Link2 },
    },
    {
      id: 2,
      title: "Make a QR Code",
      completed: hasCreatedQR,
      action: { label: "Create a QR Code", href: "/dashboard/qr/new", icon: QrCode },
    },
    {
      id: 3,
      title: "Click it, scan it, or share it",
      completed: hasCreatedLink || hasCreatedQR,
      actions: [
        { label: "View your links", href: "/dashboard", icon: Link2 },
        { label: "View your QR Codes", href: "/dashboard/qr", icon: QrCode },
      ],
    },
    {
      id: 4,
      title: "Check out Analytics",
      completed: false,
      actions: [
        { label: "View Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { label: "View plans", href: "/pricing", icon: ArrowRight },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-card p-6 shadow-soft border border-neutral-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-text">Getting started</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-indigo">{Math.round(progress)}%</span>
          <div className="w-16 h-2 rounded-full bg-neutral-bg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo via-tertiary to-secondary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="mt-0.5">
              {step.completed ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo to-tertiary flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Circle className="h-5 w-5 text-neutral-border" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm font-medium mb-2",
                step.completed ? "text-neutral-text" : "text-neutral-muted"
              )}>
                {step.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {step.action ? (
                  <Link
                    href={step.action.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      "bg-gradient-to-r from-indigo/10 to-tertiary/10 text-indigo",
                      "hover:from-indigo/20 hover:to-tertiary/20",
                      step.action.icon && "border border-indigo/20"
                    )}
                  >
                    {step.action.icon && <step.action.icon className="h-3.5 w-3.5" />}
                    {step.action.label}
                  </Link>
                ) : step.actions ? (
                  step.actions.map((action, idx) => (
                    <Link
                      key={idx}
                      href={action.href}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        "bg-gradient-to-r from-indigo/10 to-tertiary/10 text-indigo",
                        "hover:from-indigo/20 hover:to-tertiary/20",
                        action.icon && "border border-indigo/20"
                      )}
                    >
                      {action.icon && <action.icon className="h-3.5 w-3.5" />}
                      {action.label}
                    </Link>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

