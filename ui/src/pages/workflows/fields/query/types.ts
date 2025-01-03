export type Query =
    | { op: "eq" | "contains"; key: string; value: string }
    | { op: "and" | "or"; value: Query[] };
