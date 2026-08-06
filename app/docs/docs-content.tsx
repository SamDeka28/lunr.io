import type { DocsSection } from "./content/types";
import { gettingStartedSection } from "./content/getting-started";
import { useCasesSection } from "./content/use-cases";
import {
  analyticsSection,
  linksSection,
  pagesSection,
  qrSection,
} from "./content/product-areas";
import {
  apiSection,
  billingSection,
  campaignsSection,
  domainsSection,
  faqSection,
} from "./content/campaigns-and-rest";

export const docsContent: DocsSection[] = [
  gettingStartedSection,
  useCasesSection,
  linksSection,
  qrSection,
  pagesSection,
  analyticsSection,
  campaignsSection,
  domainsSection,
  billingSection,
  apiSection,
  faqSection,
];
