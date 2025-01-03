import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useViewStack } from "~/lib/view-stack/hooks";
import { type BaseFieldProps, BaseFieldWrapper } from "../base";
import QueryBuilder from "./query-builder";
import type { Query } from "./types";

type Props = BaseFieldProps<Query[]>;

export function QueryField(props: Props) {
	const { label, fieldKey, value: propValue, onValueChange } = props;
	const [value] = useState(propValue ?? []);
	const error = validateQueryField({ ...props });
	const { pushView } = useViewStack();

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Button
				onClick={() =>
					pushView(
						<QueryBuilder
							fieldKey={fieldKey}
							initialQueries={value}
							onChange={onValueChange}
						/>,
					)
				}
			>
				{label || "Query"}
			</Button>
		</BaseFieldWrapper>
	);
}

function validateQueryField(props: BaseFieldProps<Query[]>) {
	if (!props.optional && (!props.value || props.value.length === 0)) {
		return { type: "error", message: `${props.label} is required` };
	}
	return;
}
