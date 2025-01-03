import { Reference } from "./reference";
import { StarterKit } from "@tiptap/starter-kit";
import Placeholder from '@tiptap/extension-placeholder'

export const createExtensions = (data: { placeholder?: string, }) => [
    StarterKit,
    Placeholder.configure({
        placeholder: data.placeholder
    }),
    Reference.configure({
        deleteTriggerWithBackspace: true,

        renderText({ node }) {
            return `{{ ${node.attrs.accessor}: ${JSON.stringify(node.attrs)} }}`;
        },
    }),
]