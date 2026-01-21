import { Metadata } from "next";
import { ApiReferenceClient } from "./api-reference-client";

export const metadata: Metadata = {
  title: "API Reference | Lunr",
  description: "Complete API reference for Lunr Developer API",
};

export default function ApiReferencePage() {
  return <ApiReferenceClient />;
}

