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
import { FieldReferenceProvider } from "~/lib/fields/provider";

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
		<FieldReferenceProvider>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				fitView
				maxZoom={1}
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
					className={cn(
						"-z-10 [&_circle]:fill-gray-300 dark:[&_circle]:fill-muted bg-gray-50 dark:bg-background",
					)}
					variant={BackgroundVariant.Dots}
					gap={24}
					size={2}
				/>
			</ReactFlow>
		</FieldReferenceProvider>
	);
}
