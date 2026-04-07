"use client";
import { useState, useEffect } from "react";

type SiteConfig = {
  dollarRate: number;
  paymentMessage: string;
  shippingMessage: string;
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({ dollarRate: 0, paymentMessage: "", shippingMessage: "" });

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          dollarRate: data?.dollarRate || 0,
          paymentMessage: data?.paymentMessage || "",
          shippingMessage: data?.shippingMessage || "",
        });
      })
      .catch(() => {});
  }, []);

  return config;
}

/** @deprecated Use useSiteConfig() instead */
export function useDollarRate() {
  const { dollarRate } = useSiteConfig();
  return dollarRate;
}
