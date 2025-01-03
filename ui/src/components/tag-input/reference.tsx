import { type Editor, mergeAttributes, Node } from "@tiptap/core";
import type { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { PluginKey } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

export type MentionOptions = {
	HTMLAttributes: Record<string, string>;
	/** @deprecated use renderText and renderHTML instead  */
	renderLabel?: (props: {
		options: MentionOptions;
		node: ProseMirrorNode;
	}) => string;
	renderText: (props: {
		options: MentionOptions;
		node: ProseMirrorNode;
	}) => string;

	renderHTML: (props: {
		options: MentionOptions;
		node: ProseMirrorNode;
	}) => DOMOutputSpec;

	/**
	 * Whether to delete the trigger character with backspace.
	 * @default false
	 */
	deleteTriggerWithBackspace: boolean;
	suggestion: Omit<SuggestionOptions, "editor">;
};

export const MentionPluginKey = new PluginKey("mention");

type ReferenceBadgeProps = {
	node: ProseMirrorNode;
	editor: Editor;
	deleteNode: () => void;
	getPos: () => number;
};

const ReferenceBadge = (props: ReferenceBadgeProps) => {
	const editor = props.editor as Editor;

	const [isError] = useState(false);

	return (
		<NodeViewWrapper className="react-component mx-[2px]" data-drag-handle>
			<div
				className={cn(
					"flex relative  justify-center box-content items-center gap-2  h-[16px] mb-1 rounded-sm hover:cursor-default border-foreground/50 border-[1px] w-max max-w-[240px] px-2 -my-2 py-[1px]",
					isError
						? "border-red-600 bg-red-700 text-white"
						: "text-background bg-foreground",
				)}
			>
				<p className="text-[12px] font-semibold ">{props.node.attrs.label}</p>
				<X
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						const pos = props.getPos();
						editor.commands.focus(pos);
						props.deleteNode();
					}}
					className={cn(
						"h-3 w-3 mt-[2px] hover:cursor-pointer",
						isError ? "text-white" : " text-background",
					)}
				/>
			</div>
		</NodeViewWrapper>
	);
};

export const Reference = Node.create<MentionOptions>({
	name: "mention",
	draggable: true,
	addNodeView() {
		return ReactNodeViewRenderer(ReferenceBadge, {
			attrs: {
				style: "display:inline-block;",
				"data-drag-handle": "",
			},
		});
	},
	addOptions() {
		return {
			deleteTriggerWithBackspace: true,
			HTMLAttributes: {},
			renderText({ node }) {
				return `{{ ${node.attrs.accessor} : ${JSON.stringify(node.attrs.label)} }}`;
			},
			renderHTML({ options, node }) {
				return [
					"ref",
					{
						...Object.fromEntries(
							Object.entries(node.attrs).map(([key, value]) => [
								`data-${key}`,
								value,
							]),
						),
					},
					`${options.suggestion.char}${node.attrs.label}`,
				];
			},
			suggestion: {
				char: "@",
				pluginKey: MentionPluginKey,
				command: ({ editor, range, props }) => {
					// increase range.to by one when the next node is of type "text"
					// and starts with a space character
					const nodeAfter = editor.view.state.selection.$to.nodeAfter;
					const overrideSpace = nodeAfter?.text?.startsWith(" ");

					if (overrideSpace) {
						range.to += 1;
					}

					editor
						.chain()
						.focus()
						.insertContentAt(range, [
							{
								type: this.name,
								attrs: props,
							},
							{
								type: "text",
								text: " ",
							},
						])
						.run();

					window.getSelection()?.collapseToEnd();
				},
				allow: ({ state, range }) => {
					const $from = state.doc.resolve(range.from);
					const type = state.schema.nodes[this.name];
					const allow = !!$from.parent.type.contentMatch.matchType(type);

					return allow;
				},
			},
		};
	},

	group: "inline",
	inline: true,
	selectable: false,
	atom: true,
	addAttributes() {
		return {
			accessor: {
				default: null,
				parseHTML: (element) => element.innerText,
				renderHTML: (attributes) => {
					if (!attributes.accessor) {
						return {};
					}

					return {
						"data-accessor": attributes.accessor,
					};
				},
			},
			label: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-label"),
				renderHTML: (attributes) => {
					if (!attributes.label) {
						return {};
					}

					return {
						"data-label": attributes.label,
					};
				},
			},
		};
	},

	parseHTML() {
		return [{ tag: "flot-ref" }];
	},

	renderHTML({ node, HTMLAttributes }) {
		if (this.options.renderLabel !== undefined) {
			console.warn(
				"renderLabel is deprecated use renderText and renderHTML instead",
			);
			return [
				"span",
				mergeAttributes(
					{ "data-type": this.name },
					this.options.HTMLAttributes,
					HTMLAttributes,
				),
				this.options.renderLabel({
					options: this.options,
					node,
				}),
			];
		}
		const html = this.options.renderHTML({
			options: this.options,
			node,
		});
		if (typeof html === "string") {
			return [
				"span",
				mergeAttributes(
					{ "data-type": this.name },
					this.options.HTMLAttributes,
					HTMLAttributes,
				),
				html,
			];
		}
		return html;
	},

	renderText({ node }) {
		if (this.options.renderLabel !== undefined) {
			console.warn(
				"renderLabel is deprecated use renderText and renderHTML instead",
			);
			return this.options.renderLabel({
				options: this.options,
				node,
			});
		}
		return this.options.renderText({
			options: this.options,
			node,
		});
	},

	addKeyboardShortcuts() {
		return {
			Backspace: () =>
				this.editor.commands.command(({ tr, state }) => {
					let isMention = false;
					const { selection } = state;
					const { empty, anchor } = selection;

					if (!empty) {
						return false;
					}

					state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
						if (node.type.name === this.name) {
							isMention = true;
							tr.insertText(
								this.options.deleteTriggerWithBackspace
									? ""
									: this.options.suggestion.char || "",
								pos,
								pos + node.nodeSize,
							);

							return false;
						}
					});

					return isMention;
				}),
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});
