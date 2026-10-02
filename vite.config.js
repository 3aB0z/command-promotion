import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: env.VITE_SAP_API_TARGET
        ? {
            "/b1s": {
              target: env.VITE_SAP_API_TARGET,
              changeOrigin: true,
              secure: false,
              cookieDomainRewrite: "",
            },
          }
        : {},
    },
    base: "./",
  };
});
