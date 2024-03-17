import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      BASE_URL: JSON.stringify(env.MAIN_URL),
      PORT: JSON.stringify(env.PORT),
    },
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy", "classProperties"],
          },
        },
      }),
    ],
  };
});
