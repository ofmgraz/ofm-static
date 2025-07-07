// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const paragraphs   = document.querySelectorAll('p[data-target]');
  const imageRegions = document.querySelectorAll('.image-region');

  // ─────────────────────────────────────────────
  // Convert `data-points="x1,y1 x2,y2 x3,y3"` into
  // style: left, top, width, height
  // ─────────────────────────────────────────────
  imageRegions.forEach(region => {
    const pointsStr = region.getAttribute('data-points');
    if (!pointsStr) return;

    const box = parsePoints(pointsStr);
    if (box) {
      Object.assign(region.style, {
        position: 'absolute',
        left:   box.left + 'px',
        top:    box.top + 'px',
        width:  box.width + 'px',
        height: box.height + 'px'
      });
    }
  });

  // ─────────────────────────────────────────────
  // Hover behavior: paragraph ↔︎ region
  // ─────────────────────────────────────────────
  function toggleHighlight(el, add) {
    const targetId = el.getAttribute('data-target');
    el.classList.toggle('highlight', add);

    const twin = document.getElementById(targetId);
    if (twin) {
      twin.classList.toggle('highlight', add);
    }
  }

  paragraphs.forEach(p => {
    p.addEventListener('mouseenter', () => toggleHighlight(p, true));
    p.addEventListener('mouseleave', () => toggleHighlight(p, false));
  });

  imageRegions.forEach(r => {
    r.addEventListener('mouseenter', () => toggleHighlight(r, true));
    r.addEventListener('mouseleave', () => toggleHighlight(r, false));
  });

  // ─────────────────────────────────────────────
  // Helper: extract bounding box from points
  // Like Python's: [x1, y1, x2 - x1, y2 - y1]
  // ─────────────────────────────────────────────
  function parsePoints(pointsStr) {
    const parts = pointsStr.trim().split(/\s+/);
    if (parts.length < 3) return null;

    const [x1, y1] = parts[0].split(',').map(Number);
    const [x2, y2] = parts[2].split(',').map(Number);

    return {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  }
});
