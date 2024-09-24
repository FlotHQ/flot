import { Combobox } from "~/components/combobox";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useViewStack } from "~/lib/view-stack/hooks";
import { TagInput } from "~/components/tag-input/tag";
import { useNodeId } from "reactflow";
import { useFieldReference } from "~/lib/fields/hooks";

type Query =
	| {
			op: "eq" | "contains";
			key: string;
			value: string;
	  }
	| {
			op: "and" | "or";
			value: Query[];
	  };

type Props = BaseFieldProps<Query[]>;

export function QueryField(props: Props) {
	const [value] = useState(props.value ?? []);

	const error = validateQueryField({ ...props, value });

	const { pushView } = useViewStack();

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Button
				onClick={() => {
					pushView(
						<QueryBuilder
							fieldKey={props.fieldKey}
							initialQueries={value}
							onChange={(queries) => {
								props.onValueChange(queries);
							}}
						/>,
					);
				}}
			>
				{props.label || "Query"}
			</Button>
		</BaseFieldWrapper>
	);
}

type QueryBuilderProps = {
	initialQueries: Query[];
	fieldKey: string;
	onChange: (queries: Query[]) => void;
};

type ConditionProps = {
	query: Query;
	onValueChange: (query: Query) => void;
	fieldKey: string;
};
function Condition(props: ConditionProps) {
	const [op, setOp] = useState<string>(props.query.op);
	const nodeId = useNodeId();
	const { register } = useFieldReference();

	if (!nodeId) {
		return;
	}

	if (props.query.op === "and" || props.query.op === "or") {
		const query = props.query as { op: "and" | "or"; value: Query[] };
		const withIds = query.value.map((query) => ({
			...query,
			id: crypto.randomUUID(),
		}));

		return (
			<div className="border-[1px] rounded-md border-border p-2 flex flex-col gap-2">
				{withIds.map((q, index) => (
					<div key={q.id}>
						<Condition
							fieldKey={props.fieldKey}
							query={q}
							onValueChange={() => {}}
						/>

						<div className="w-full flex justify-center mt-2">
							{index < withIds.length - 1 && (
								<p className=" text-xs text-muted-foreground">
									{op === "and" ? "AND" : "OR"}
								</p>
							)}
						</div>
					</div>
				))}
				<QueryBuilderControls
					addNewQuery={(q) => {
						props.onValueChange({
							...query,
							value: [...query.value, q],
						});
					}}
				/>
			</div>
		);
	}

	return (
		<div className="flex gap-2 flex-col">
			<div className="flex gap-2">
				<TagInput
					key={nodeId}
					type="text"
					fieldKey={props.fieldKey}
					nodeId={nodeId}
					value=""
					{...register(nodeId, props.fieldKey)}
					onValueChange={(value) => {
						console.log("..>", value);
					}}
				/>
				<Combobox
					initialValue={op}
					onValueChange={(value) => setOp(value)}
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

function QueryBuilderControls(props: { addNewQuery: (query: Query) => void }) {
	return (
		<div>
			<Button
				size="sm"
				onClick={() => props.addNewQuery({ op: "eq", key: "", value: "" })}
				variant="ghost"
			>
				Add Condition
			</Button>
			<Button
				size="sm"
				onClick={() => props.addNewQuery({ op: "and", value: [] })}
				variant="ghost"
			>
				AND
			</Button>
			<Button
				onClick={() => props.addNewQuery({ op: "or", value: [] })}
				size="sm"
				variant="ghost"
			>
				OR
			</Button>
		</div>
	);
}

function QueryBuilder(props: QueryBuilderProps) {
	const [queries, setQueries] = useState(
		props.initialQueries.map((query) => ({
			...query,
			id: crypto.randomUUID(),
		})),
	);

	const addNewQuery = (query: Query) => {
		setQueries((prev) => [
			...prev,
			{
				...query,
				id: crypto.randomUUID(),
			},
		]);
	};

	return (
		<ul className="gap-2 flex flex-col">
			{queries.map((query, index) => (
				<>
					<div key={query.id}>
						<Condition
							fieldKey={props.fieldKey}
							query={query}
							onValueChange={(value) => {
								setQueries((prev) =>
									prev.map((q) => {
										if (q.id === query.id) {
											return { ...value, id: query.id };
										}
										return q;
									}),
								);
							}}
						/>

						<div className="w-full flex justify-center mt-2">
							{index < queries.length - 1 && (
								<p className=" text-xs text-muted-foreground">AND</p>
							)}
						</div>
					</div>
				</>
			))}
			<QueryBuilderControls addNewQuery={addNewQuery} />
		</ul>
	);
}

export function validateQueryField(props: BaseFieldProps<Query[]>) {
	if (
		!props.optional &&
		(props.value === undefined || props.value.length === 0)
	) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
