import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

type SortableItemProps = {
	id: string;
	children: ReactNode;
};

export function SortableItem(props: SortableItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{props.children}
		</div>
	);
}
