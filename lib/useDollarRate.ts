"use client";
import { useState, useEffect } from "react";

type SiteConfig = {
  dollarRate: number;
  paymentMethods: string[];
  shippingMethods: string[];
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>({ dollarRate: 0, paymentMethods: [], shippingMethods: [] });

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          dollarRate: data?.dollarRate || 0,
          paymentMethods: data?.paymentMethods || [],
          shippingMethods: data?.shippingMethods || [],
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
