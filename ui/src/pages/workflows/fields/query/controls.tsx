import { Button } from "~/components/ui/button";
import type { Query } from "./types";

export default function QueryBuilderControls({
	addNewQuery,
}: { addNewQuery: (query: Query) => void }) {
	return (
		<div>
			<Button
				size="sm"
				onClick={() => addNewQuery({ op: "eq", key: "", value: "" })}
				variant="ghost"
			>
				Add Condition
			</Button>
			<Button
				size="sm"
				onClick={() => addNewQuery({ op: "and", value: [] })}
				variant="ghost"
			>
				AND
			</Button>
			<Button
				size="sm"
				onClick={() => addNewQuery({ op: "or", value: [] })}
				variant="ghost"
			>
				OR
			</Button>
		</div>
	);
}
