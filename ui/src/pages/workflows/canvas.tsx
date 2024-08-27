import { useCallback } from "react";
import "reactflow/dist/style.css";
import {
	addEdge,
	Background,
	BackgroundVariant,
	ReactFlow,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "reactflow";
import type { Connection, OnConnect } from "reactflow";
import { useTheme } from "~/lib/theme/hooks";
import { cn } from "~/lib/utils";
import { GeneralNode } from "./nodes/general";
import { isValidConnection } from "./utils";

type Props = {
	initialNodes: {
		id: string;
		position: { x: number; y: number };
		data: { label: string };
	}[];
	initialEdges: { source: string; target: string; id: string }[];
};

const nodeTypes = {
	general: GeneralNode,
};

export function WorkflowCanvas(props: Props) {
	const [nodes, , onNodesChange] = useNodesState(props.initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(props.initialEdges);

	const { theme } = useTheme();

	const onConnect = useCallback(
		(params: Parameters<OnConnect>[0]) =>
			setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	const { getNodes, getEdges } = useReactFlow();

	const _isValidConnection = useCallback(
		(connection: Connection) => {
			const nodes = getNodes();
			const edges = getEdges();
			return isValidConnection(nodes, edges, connection);
		},
		[getNodes, getEdges],
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			nodeTypes={nodeTypes}
			proOptions={{
				hideAttribution: true,
			}}
			isValidConnection={_isValidConnection}
			selectionOnDrag={false}
			selectNodesOnDrag={false}
		>
			<Background
				color={theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)"}
				className={cn(
					"-z-10 ",
					theme === "dark" ? "bg-[#727272]" : "bg-slate-100/45",
				)}
				variant={BackgroundVariant.Dots}
				style={{
					// #111111
					background:
						theme === "dark"
							? "linear-gradient(197deg, hsl(0, 0%, 8%), hsl(0, 0%, 3%) 60%)"
							: "hsl(0deg 0% 98%)",
					// inner shadow
					boxShadow:
						theme === "dark"
							? "inset 0 0 50px hsl(0, 0%, 8%)"
							: "inset 0 0 30px hsl(0, 0%, 90%)",
				}}
				gap={24}
				size={2}
			/>
		</ReactFlow>
	);
}
