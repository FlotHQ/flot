import { getOutgoers } from "reactflow";
import type { Connection, Edge, Node } from "reactflow";

export function isValidConnection(
	nodes: Node[],
	edges: Edge[],
	connection: Connection,
) {
	const target = nodes.find((node) => node.id === connection.target);

	if (!target) return false;

	const hasCycle = (node: Node, visited = new Set()) => {
		if (visited.has(node.id)) return false;

		visited.add(node.id);

		for (const outgoer of getOutgoers(node, nodes, edges)) {
			if (outgoer.id === connection.source) return true;
			if (hasCycle(outgoer, visited)) return true;
		}
	};

	if (target.id === connection.source) return false;
	return !hasCycle(target);
}
