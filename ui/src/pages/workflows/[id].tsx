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
					label: "On New Row",
					isTrigger: true,
					icon: "supabase.com",
					collection: "Supabase",
				},
			},
			{
				id: "2",
				type: "general",
				position: { x: 400, y: 0 },
				data: {
					label: "Generate Completion",
					icon: "openai.com",
					collection: "OpenAI",
				},
			},
			{
				id: "3",
				type: "general",
				position: { x: 800, y: 0 },
				data: {
					label: "Send Email",
					icon: "resend.com",
					collection: "Resend",
				},
			},
		],
		edges: [
			{ source: "1", target: "2", id: "1" },
			{ source: "2", target: "3", id: "2" },
		],
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
