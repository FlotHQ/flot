import type { BaseFieldProps } from "./base"

export type GroupField = {
    type: "group",
    fields: Field[],
    isInitiallyOpen?: boolean,
} & BaseFieldProps<{
    [key: string]: unknown
}>

export type TextField = {
    type: "text"
} & BaseFieldProps<unknown>

export type NumberField = {
    type: "number"
} & BaseFieldProps<number>

export type SelectField = {
    type: "select",
    options: { value: string, label: string }[]
} & BaseFieldProps<string>



export type Field = GroupField | TextField | NumberField | SelectField