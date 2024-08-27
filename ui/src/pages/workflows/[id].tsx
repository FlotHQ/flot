import { useParams } from "react-router-dom";
import { WorkflowCanvas } from "./canvas";
import { ReactFlowProvider } from "reactflow";

export function Component() {
	const { id } = useParams();
	const workflow = {
		id: id,
		title: "My Workflow",
		description: "This is a workflow description",
		createdAt: new Date(),
		updatedAt: new Date(),
		nodes: [
			{
				id: "1",
				position: { x: 0, y: 0 },
				type: "general",
				data: {
					label: "Start",
					isTrigger: true,
					icon: "start",
					collection: "Personal",
				},
			},
			{
				id: "2",
				type: "general",
				position: { x: 200, y: 100 },
				data: { label: "End", icon: "end", collection: "Personal" },
			},
			{
				id: "3",
				type: "general",
				position: { x: 300, y: 100 },
				data: { label: "End", icon: "end", collection: "Personal" },
			},
		],
		edges: [],
	};

	return (
		<ReactFlowProvider>
			<WorkflowCanvas
				initialNodes={workflow.nodes}
				initialEdges={workflow.edges}
			/>
		</ReactFlowProvider>
	);
}
