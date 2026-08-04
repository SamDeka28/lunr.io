"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Dashboard page transition.
 *
 * A `template.tsx` (unlike `layout.tsx`) is re-mounted on every navigation, so
 * wrapping the page content in a `motion.div` re-fires the enter animation each
 * time the user switches tabs. The animation is intentionally short and subtle
 * so it reads as "snappy" and runs on the incoming content once its `loading.tsx`
 * skeleton resolves. Users who prefer reduced motion get no animation.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
