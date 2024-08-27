import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
	createBrowserRouter,
	RouterProvider,
	useRouteError,
} from "react-router-dom";
import { Layout } from "./layout/index.tsx";
import "@fontsource-variable/inter";
import { StyledLink } from "./components/ui/styled-link.tsx";
import { FlotLogo } from "./components/logo.tsx";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-full w-full pt-24">
			<FlotLogo />
			<div className="mt-12 flex flex-col items-center justify-center gap-2">
				<h1>404 - Page Not Found</h1>
				<h3>The page you are looking for does not exist</h3>
				<StyledLink to="/" variant="secondary" className="mt-4 pl-4 pr-6">
					<ArrowLeftIcon className="mr-2" />
					<span>Go to Home</span>
				</StyledLink>
			</div>
		</div>
	);
}

function ErrorRoute() {
	const error = useRouteError();
	console.error(error);
	return <div>Error: {JSON.stringify(error)}</div>;
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorRoute />,
		children: [
			{
				element: <NotFound />,
				path: "*",
			},
			{
				element: <Layout />,
				children: [
					{ path: "/", lazy: () => import("./pages/dashboard") },
					{ path: "/workflows", lazy: () => import("./pages/workflows") },
					{
						path: "/workflows/:id",
						lazy: () => import("./pages/workflows/[id].tsx"),
					},
					{ path: "/collections", lazy: () => import("./pages/collections") },
					{
						path: "/collections/:id",
						lazy: () => import("./pages/collections/[id]"),
					},
					{ path: "/templates", lazy: () => import("./pages/templates") },
					/*
        	{
						path: "/organizations",
						lazy: () => import("./pages/organizations"),
					},
        */
					{ path: "/billing", lazy: () => import("./pages/billings") },
				],
			},
			{
				children: [
					{ path: "/login", lazy: () => import("./pages/auth/login") },
					{ path: "/signup", lazy: () => import("./pages/auth/signup") },
				],
			},
		],
	},
]);

const root = document.getElementById("root");

if (!root) {
	throw new Error("Root element not found");
}

createRoot(root).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
