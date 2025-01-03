import { useState } from "react";
import { Combobox } from "~/components/combobox";
import { TagInput } from "~/components/tag-input/tag";
import { Input } from "~/components/ui/input";
import { useNodeId } from "reactflow";
import { useFieldReference } from "~/lib/fields/hooks";
import type { Query } from "./types";
import QueryBuilderControls from "./controls";

type ConditionProps = {
	query: Query;
	onValueChange: (query: Query) => void;
	fieldKey: string;
};

export default function Condition({
	query,
	fieldKey,
	onValueChange,
}: ConditionProps) {
	const [op, setOp] = useState(query.op);
	const nodeId = useNodeId();
	const { register } = useFieldReference();

	if (!nodeId) return null;

	if (query.op === "and" || query.op === "or") {
		const subQueries = query.value.map((subQuery) => ({
			...subQuery,
			id: crypto.randomUUID(),
		}));

		return (
			<div className="border-[1px] rounded-md border-border p-2 flex flex-col gap-2">
				{subQueries.map((subQuery, index) => (
					<div key={subQuery.id}>
						<Condition
							fieldKey={fieldKey}
							query={subQuery}
							onValueChange={() => {}}
						/>
						{index < subQueries.length - 1 && (
							<div className="w-full flex justify-center mt-2">
								<p className="text-xs text-muted-foreground">
									{op === "and" ? "AND" : "OR"}
								</p>
							</div>
						)}
					</div>
				))}
				<QueryBuilderControls
					addNewQuery={(q) => {
						onValueChange({
							...query,
							value: [...query.value, q],
						});
					}}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<TagInput
					key={nodeId}
					type="text"
					fieldKey={fieldKey}
					nodeId={nodeId}
					value=""
					{...register(nodeId, fieldKey)}
					onValueChange={(value) => console.log("..>", value)}
				/>
				<Combobox
					initialValue={op}
					onValueChange={(value) => setOp(value as Query["op"])}
					options={[
						{ label: "Equals", value: "eq" },
						{ label: "Contains", value: "contains" },
					]}
					placeholder="Select Operation"
				/>
			</div>
			<Input />
		</div>
	);
}
