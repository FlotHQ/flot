import { useEffect, useState } from "react";
import * as FlexSearchh from "flexsearch";
//@ts-expect-error flexsearch types are incomplete
const Document = FlexSearchh.default.Document as typeof FlexSearchh.Document;

type UseFlexSearchProps = {
    searchKeys: string[];
    indexData?: Record<string, unknown>;
};

export function useFlexSearch({ searchKeys, indexData }: UseFlexSearchProps) {
    const [index, setIndex] = useState<FlexSearchh.Document<unknown, false>>();
    const [search, setSearch] = useState("");
    const [ids, setIds] = useState<string[]>([]);

    useEffect(() => {
        if (!indexData) return;

        const index = new Document({
            document: {
                id: "id",
                index: searchKeys,
            },
            tokenize: "full",
        });

        for (const [id, item] of Object.entries(indexData)) {
            index.import(id, item);
        }

        setIndex(index);
    }, [indexData]);

    useEffect(() => {
        async function searchFn() {
            if (!index || !search) {
                setIds([]);
                return;
            }

            const results = await index.searchAsync(search, { limit: 10 });
            const searchIds = Array.from(new Set(...results.map(r => r.result))) as string[];
            setIds(searchIds);
        }

        searchFn();
    }, [search, index]);

    return {
        search,
        setSearch,
        ids
    };
} 