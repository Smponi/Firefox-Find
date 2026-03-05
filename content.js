(function () {
  if (document.getElementById('ffind-bar')) return;

  let marks = [];
  let currentIndex = -1;
  let ignoreNextMutation = false;
  let debounceTimer = null;

  // --- UI ---

  const bar = document.createElement('div');
  bar.id = 'ffind-bar';
  bar.innerHTML = `
    <input id="ffind-input" type="text" placeholder="Find in page…" autocomplete="off" />
    <span id="ffind-count"></span>
    <button id="ffind-prev">&#8593;</button>
    <button id="ffind-next">&#8595;</button>
    <button id="ffind-close">&#x2715;</button>
  `;

  function showBar() {
    document.body.appendChild(bar);
    document.getElementById('ffind-input').focus();
  }

  function hideBar() {
    clearHighlights();
    bar.remove();
  }

  // --- Highlight logic ---

  function clearHighlights() {
    ignoreNextMutation = true;
    document.querySelectorAll('mark.ffind-match').forEach(m => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      }
    });
    marks = [];
    currentIndex = -1;
    updateCount();
  }

  function search(query) {
    clearHighlights();
    if (!query) return;

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const tag = node.parentElement && node.parentElement.tagName;
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(tag)) return NodeFilter.FILTER_REJECT;
          if (node.parentElement && node.parentElement.id === 'ffind-bar') return NodeFilter.FILTER_REJECT;
          return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    ignoreNextMutation = true;
    for (const textNode of textNodes) {
      const text = textNode.textContent;
      let match;
      let lastIndex = 0;
      const fragments = [];
      regex.lastIndex = 0;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const mark = document.createElement('mark');
        mark.className = 'ffind-match';
        mark.textContent = match[0];
        marks.push(mark);
        fragments.push(mark);
        lastIndex = regex.lastIndex;
      }

      if (fragments.length === 0) continue;
      if (lastIndex < text.length) fragments.push(document.createTextNode(text.slice(lastIndex)));

      const parent = textNode.parentNode;
      fragments.forEach(f => parent.insertBefore(f, textNode));
      parent.removeChild(textNode);
    }

    if (marks.length > 0) {
      currentIndex = 0;
      scrollToMatch(0);
    }
    updateCount();
  }

  function scrollToMatch(index) {
    marks.forEach(m => m.classList.remove('ffind-current'));
    if (marks[index]) {
      marks[index].classList.add('ffind-current');
      marks[index].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function updateCount() {
    const el = document.getElementById('ffind-count');
    if (!el) return;
    if (marks.length === 0) {
      el.textContent = document.getElementById('ffind-input')?.value ? '0 / 0' : '';
    } else {
      el.textContent = `${currentIndex + 1} / ${marks.length}`;
    }
  }

  // --- Navigation ---

  function next() {
    if (!marks.length) return;
    currentIndex = (currentIndex + 1) % marks.length;
    scrollToMatch(currentIndex);
    updateCount();
  }

  function prev() {
    if (!marks.length) return;
    currentIndex = (currentIndex - 1 + marks.length) % marks.length;
    scrollToMatch(currentIndex);
    updateCount();
  }

  // --- Events ---

  document.addEventListener('keydown', e => {
    const isFind = (e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey);
    if (isFind) {
      e.preventDefault();
      e.stopPropagation();
      if (!document.body.contains(bar)) {
        showBar();
      } else {
        document.getElementById('ffind-input').focus();
        document.getElementById('ffind-input').select();
      }
      return;
    }
    if (e.key === 'Escape' && document.body.contains(bar)) {
      hideBar();
    }
    if (e.key === 'Enter' && document.body.contains(bar)) {
      e.shiftKey ? prev() : next();
    }
  }, true);

  bar.addEventListener('click', e => {
    if (e.target.id === 'ffind-close') hideBar();
    if (e.target.id === 'ffind-next') next();
    if (e.target.id === 'ffind-prev') prev();
  });

  bar.addEventListener('input', e => {
    if (e.target.id === 'ffind-input') search(e.target.value);
  });

  bar.addEventListener('keydown', e => e.stopPropagation());

  // --- MutationObserver ---

  const observer = new MutationObserver(() => {
    if (ignoreNextMutation) {
      ignoreNextMutation = false;
      return;
    }
    const query = document.getElementById('ffind-input')?.value;
    if (!query) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(query), 200);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
