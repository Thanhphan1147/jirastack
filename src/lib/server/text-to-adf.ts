export interface AdfNode {
	type: string;
	version?: number;
	content?: AdfNode[];
	text?: string;
	attrs?: Record<string, unknown>;
}

/**
 * Wraps plain text into a minimal ADF document.
 * Each non-empty line becomes a paragraph; blank lines are preserved as empty paragraphs.
 */
export function textToAdf(text: string): AdfNode {
	const lines = text.split(/\r?\n/);
	const content: AdfNode[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed) {
			content.push({
				type: 'paragraph',
				content: [{ type: 'text', text: trimmed }]
			});
		} else {
			content.push({ type: 'paragraph', content: [] });
		}
	}

	// Trim trailing empty paragraphs
	while (content.length > 1 && content[content.length - 1].content?.length === 0) {
		content.pop();
	}

	return {
		version: 1,
		type: 'doc',
		content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }]
	};
}
