import * as FlexSearch from 'flexsearch'
//@ts-expect-error ts error idk
const Document = FlexSearch.default.Document as typeof FlexSearch.Document
import fs from "node:fs/promises";
import { join } from "node:path";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

type Dataset = {
    items: {
        id: string;
        [key: string]: string;
    }[];
    fields: string[];
};

const datasets = await fs.readdir(join(__dirname, "datasets"));

for (const dataset of datasets) {
    const data = await fs.readFile(join(__dirname, "datasets", dataset), "utf-8");
    const json = JSON.parse(data) as Dataset;

    const index = new Document({
        document: {
            id: "id",
            index: json.fields,
        },
        tokenize: "full",
        preset: "score",
        optimize: true,
    });

    for (const item of json.items) {
        await index.addAsync(item.id, item);
    }

    const results = await index.searchAsync("col", {
        limit: 10,
        suggest: true,
    });

    console.log("--> ", results);

    const exportData = {} as Record<string, Record<string, string>>

    await index.export((id, item) => {
        exportData[id] = item as Record<string, string>;
    })

    await fs.writeFile(join(__dirname, "public", "indexes", dataset), JSON.stringify(exportData));
}
