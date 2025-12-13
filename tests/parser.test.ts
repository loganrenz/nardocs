import { describe, it, expect } from 'vitest';
import { HtmlParser } from '../src/parsers/html.js';

describe('HtmlParser', () => {
  const parser = new HtmlParser();

  describe('parseHtml (via extractContent)', () => {
    // Note: These tests would normally mock the fetch call
    // For now, we test the behavior indirectly

    it('should be instantiable', () => {
      expect(parser).toBeDefined();
      expect(parser).toBeInstanceOf(HtmlParser);
    });
  });
});
