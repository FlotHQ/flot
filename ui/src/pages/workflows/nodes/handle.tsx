import { Handle, Position } from "reactflow";
import { cn } from "~/lib/utils";

type Props = {
	nodeId: string;
	type: "source" | "target";
	handlePos: "left" | "right";
	className?: string;
	maxConnections: number;
};

export function RelativeHandle(props: Props) {
	console.log(props);
	return (
		<Handle
			style={{
				zIndex: 50000,
				right: -16,
				borderRadius:
					props.handlePos === "left" ? "0 3px 3px 0" : "3px 0 0 3px",
				width: "8px",
				height: "10px",
			}}
			type={props.type}
			position={Position.Right}
			isConnectable={true}
			data-handlepos={props.handlePos}
			className={cn(
				"nodrag handle-custom pointer-events-auto  ",
				props.handlePos === "left" ? "handle-left" : "handle-right",
				props.className,
			)}
		/>
	);
}
