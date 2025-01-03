import { useState } from "react";
import type { Query } from "./types";
import Condition from "./condition";
import QueryBuilderControls from "./controls";

type QueryBuilderProps = {
	initialQueries: Query[];
	fieldKey: string;
	onChange: (queries: Query[]) => void;
};

export default function QueryBuilder({
	initialQueries,
	fieldKey,
	onChange,
}: QueryBuilderProps) {
	const [queries, setQueries] = useState(() =>
		initialQueries.map((query) => ({ ...query, id: crypto.randomUUID() })),
	);

	const addNewQuery = (newQuery: Query) => {
		setQueries((prev) => [...prev, { ...newQuery, id: crypto.randomUUID() }]);
	};

	return (
		<ul className="flex flex-col gap-2">
			{queries.map((query, index) => (
				<div key={query.id}>
					<Condition
						fieldKey={fieldKey}
						query={query}
						onValueChange={(updatedQuery) => {
							setQueries((prev) =>
								prev.map((q) =>
									q.id === query.id ? { ...updatedQuery, id: query.id } : q,
								),
							);
							onChange(queries);
						}}
					/>
					{index < queries.length - 1 && (
						<div className="w-full flex justify-center mt-2">
							<p className="text-xs text-muted-foreground">AND</p>
						</div>
					)}
				</div>
			))}
			<QueryBuilderControls addNewQuery={addNewQuery} />
		</ul>
	);
}
