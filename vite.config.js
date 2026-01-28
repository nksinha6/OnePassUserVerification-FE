import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files for this mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Base path for dev vs production
    base: mode === "development" ? "/" : "/user/",

    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },

    server: {
      host: true,
      allowedHosts: ["all", "f9114aa96710.ngrok-free.app"],
      proxy: {
        "/api": {
          target: env.API_TARGET, // Read from env
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
