import { useParams } from "react-router-dom";

export function Component() {
    const { id } = useParams();
	return <div> Collection {id}</div>;
}