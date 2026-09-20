import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { weatherResponse } from "./worker/weather.mjs";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), {
    name: 'farm-weather-preview',
    configureServer(server) {
      server.middlewares.use('/api/weather', async (req, res) => {
        const response = await weatherResponse(new Request('http://terminal.local/api/weather', {method:req.method}), process.env);
        res.statusCode=response.status;
        response.headers.forEach((value,key)=>res.setHeader(key,value));
        res.end(await response.text());
      });
    },
  }],
});
