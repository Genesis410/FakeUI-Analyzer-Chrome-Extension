/**
 * DOM Normalization Utility
 * Prepares the login form DOM for structural hashing.
 */

/**
 * Normalizes a DOM element by stripping dynamic attributes and whitespace.
 * @param {HTMLElement} element 
 * @returns {string} The normalized structural string.
 */
export function normalizeDOM(element) {
  // Clone the element to avoid modifying the live page
  const clone = element.cloneNode(true);

  // 1. Remove script and style tags
  const scripts = clone.querySelectorAll('script, style');
  scripts.forEach(s => s.remove());

  // 2. Remove all elements that are purely for tracking/styling (id, class, style)
  const allElements = clone.querySelectorAll('*');
  allElements.forEach(el => {
    el.removeAttribute('id');
    el.removeAttribute('class');
    el.removeAttribute('style');
    
    // Remove data attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // 3. Remove all text content (we only care about the structural tags)
  // We iterate through all nodes and clear text nodes
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null, false);
  let node;
  const textNodes = [];
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  textNodes.forEach(tn => tn.textContent = '');

  // 4. Final cleanup: strip whitespace and line breaks from the outerHTML
  return clone.outerHTML.replace(/\s+/g, '');
}
