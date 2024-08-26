import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:8081",
				changeOrigin: true,
			},
		},
		host: true,
		port: 8080,
	},

	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
});
