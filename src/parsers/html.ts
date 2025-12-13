import * as cheerio from 'cheerio';

/**
 * Options for HTML content extraction
 */
export interface ExtractOptions {
  maxLength?: number;
}

/**
 * Result of HTML extraction
 */
export interface ExtractResult {
  content: string;
  url: string;
  truncated: boolean;
}

/**
 * Extract clean, readable content from HTML documentation pages
 */
export class HtmlParser {
  private readonly defaultMaxLength = 10000;

  /**
   * Fetch and parse HTML content from a URL
   * @param url - The URL to fetch
   * @param options - Extraction options
   * @returns Extracted content with metadata
   */
  async extractContent(url: string, options: ExtractOptions = {}): Promise<ExtractResult> {
    const maxLength = options.maxLength || this.defaultMaxLength;

    try {
      // Import fetch dynamically
      const fetch = (await import('node-fetch')).default;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseHtml(html, url, maxLength);
    } catch (error) {
      throw new Error(
        `Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse HTML and extract main content
   * @param html - Raw HTML string
   * @param url - Source URL for reference
   * @param maxLength - Maximum content length
   * @returns Extracted content with metadata
   */
  private parseHtml(html: string, url: string, maxLength: number): ExtractResult {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, .nav, .navigation, .sidebar, .footer, .header').remove();

    // Try to find main content area
    let content = '';
    const mainSelectors = [
      'main',
      '[role="main"]',
      '.content',
      '#content',
      '.main-content',
      '.documentation',
      'article',
      '.markdown-body',
    ];

    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    // Fallback to body if no main content found
    if (!content) {
      content = $('body').text();
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    // Truncate intelligently if needed
    let truncated = false;
    if (content.length > maxLength) {
      truncated = true;
      // Try to truncate at a sentence or paragraph boundary
      const truncatePoint = this.findTruncatePoint(content, maxLength);
      content = content.substring(0, truncatePoint) + '...';
    }

    return {
      content,
      url,
      truncated,
    };
  }

  /**
   * Find a good point to truncate content (avoid cutting mid-sentence)
   * @param content - Content to truncate
   * @param maxLength - Maximum length
   * @returns Index to truncate at
   */
  private findTruncatePoint(content: string, maxLength: number): number {
    // Try to find last sentence ending before maxLength
    const sentenceEndings = ['. ', '.\n', '! ', '!\n', '? ', '?\n'];
    let bestPoint = -1;

    for (const ending of sentenceEndings) {
      const lastIndex = content.lastIndexOf(ending, maxLength);
      if (lastIndex > maxLength * 0.8) {
        // Only use if reasonably close to maxLength
        bestPoint = Math.max(bestPoint, lastIndex + ending.length);
      }
    }

    // If no good sentence ending found, use maxLength
    return bestPoint > 0 ? bestPoint : maxLength;
  }
}
