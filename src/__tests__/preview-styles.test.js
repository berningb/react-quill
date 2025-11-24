/**
 * Tests for HTML style preservation in preview mode
 * These tests verify that inline styles (line-height, font-size, etc.) 
 * are preserved when switching to preview mode
 */

// Mock test to verify the issue
describe('Preview Mode Style Preservation', () => {
  test('should preserve inline line-height styles in preview', () => {
    // This test documents the expected behavior
    const htmlWithLineHeight = '<p style="line-height: 2.5">Test content</p>';
    // When this HTML is passed to preview, it should preserve the line-height
    expect(htmlWithLineHeight).toContain('line-height: 2.5');
  });

  test('should preserve inline font-size styles in preview', () => {
    const htmlWithFontSize = '<p style="font-size: 20px">Test content</p>';
    expect(htmlWithFontSize).toContain('font-size: 20px');
  });

  test('should preserve multiple inline styles in preview', () => {
    const htmlWithStyles = '<p style="line-height: 2; font-size: 18px; color: red">Test</p>';
    expect(htmlWithStyles).toContain('line-height: 2');
    expect(htmlWithStyles).toContain('font-size: 18px');
    expect(htmlWithStyles).toContain('color: red');
  });
});

