"use client";

import { PageLayoutProps, LayoutTemplate } from "./types";
import { HeroLayout } from "./hero-layout";
import { AsymmetricLayout } from "./asymmetric-layout";
import { GlassmorphismLayout } from "./glassmorphism-layout";
import { SplitLayout } from "./split-layout";
import { CenteredLayout } from "./centered-layout";
import { PortfolioLayout } from "./portfolio-layout";
import { GridLayout } from "./grid-layout";
import { MagazineLayout } from "./magazine-layout";
import { BoldTypographyLayout } from "./bold-typography-layout";

interface PageLayoutRendererProps extends PageLayoutProps {
  layoutTemplate: LayoutTemplate;
  Globe: React.ComponentType<any>;
}

export function PageLayoutRenderer(props: PageLayoutRendererProps) {
  const { layoutTemplate, ...layoutProps } = props;

  switch (layoutTemplate) {
    case "hero":
      return <HeroLayout {...layoutProps} />;
    case "left":
      return <AsymmetricLayout {...layoutProps} />;
    case "card":
      return <GlassmorphismLayout {...layoutProps} />;
    case "split":
      return <SplitLayout {...layoutProps} />;
    case "sidebar":
      return <PortfolioLayout {...layoutProps} />;
    case "grid":
      return <GridLayout {...layoutProps} />;
    case "magazine":
      return <MagazineLayout {...layoutProps} />;
    case "minimal":
      return <BoldTypographyLayout {...layoutProps} />;
    case "centered":
    default:
      return <CenteredLayout {...layoutProps} />;
  }
}

