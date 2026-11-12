import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "vn.bevuihoc.app",
  appName: "Bé Vui Học",
  webDir: "ios-web",
  server: {
    // Bevuihoc is a TanStack Start SSR app. Keep its existing production origin
    // instead of incorrectly packaging the server-rendered output as static files.
    url: "https://bevuihoc.lovable.app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scrollEnabled: true,
    backgroundColor: "#FFF7E8",
  },
};

export default config;
