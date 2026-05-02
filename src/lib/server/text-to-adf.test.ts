import { describe, it, expect } from 'vitest';
import { textToAdf } from './text-to-adf.js';

describe('textToAdf', () => {
	it('should wrap a single line in a paragraph', () => {
		const result = textToAdf('Hello world');
		expect(result).toEqual({
			version: 1,
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }]
		});
	});

	it('should split multiple lines into paragraphs', () => {
		const result = textToAdf('Line one\nLine two\nLine three');
		expect(result.content).toHaveLength(3);
		expect(result.content![0].content![0].text).toBe('Line one');
		expect(result.content![2].content![0].text).toBe('Line three');
	});

	it('should handle blank lines as empty paragraphs', () => {
		const result = textToAdf('Before\n\nAfter');
		expect(result.content).toHaveLength(3);
		expect(result.content![1]).toEqual({ type: 'paragraph', content: [] });
	});

	it('should trim trailing empty paragraphs', () => {
		const result = textToAdf('Hello\n\n\n');
		expect(result.content).toHaveLength(1);
		expect(result.content![0].content![0].text).toBe('Hello');
	});

	it('should return an empty paragraph for empty input', () => {
		const result = textToAdf('');
		expect(result).toEqual({
			version: 1,
			type: 'doc',
			content: [{ type: 'paragraph', content: [] }]
		});
	});

	it('should return an empty paragraph for whitespace-only input', () => {
		const result = textToAdf('   \n  \n  ');
		expect(result.content).toHaveLength(1);
		expect(result.content![0].content).toEqual([]);
	});

	it('should handle Windows-style line endings', () => {
		const result = textToAdf('Line one\r\nLine two');
		expect(result.content).toHaveLength(2);
	});
});
