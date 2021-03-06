//
// HLF Media Grid Visual Tests
// ===========================
// [Page](../../../tests/media-grid.visual.html) | [Source](../../src/js/media-grid.html)
//
(function() {
  'use strict';
  if (window.guard && !guard.isNavigatorSupported) { return; }

  require.config({ baseUrl: '../', paths: { hlf: 'dist', test: 'tests/js' } });
  define(['test/base', 'hlf/media-grid'], function(base, MediaGrid) {
    if (window.QUnit) {
      const { module, test } = QUnit;
      module('HLF.MediaGrid', {
        beforeEach() {
          let element = document.createElement('div');
          element.innerHTML = (
`<div>
  <div class="js-mg-item"></div>
  <div class="js-mg-item"></div>
  <div class="js-mg-item"></div>
</div>`
          );
          document.getElementById('qunit-fixture').appendChild(element);
          this.mediaGrid = MediaGrid.extend(element);
        },
      });
      test('#_updateMetrics', function(assert) {
        const { mediaGrid } = this;
        let { style } = mediaGrid.element;
        style.boxSizing = 'border-box';
        style.padding = '10px';
        mediaGrid.itemElements.forEach((itemElement) => {
          let { style } = itemElement;
          style.borderWidth = '1px';
          style.boxSizing = 'border-box';
          style.marginRight = '10px';
          style.padding = '9px';
          style.width = style.height = '200px';
        });
        style = mediaGrid.element.parentElement.style;
        style.width = '610px';
        let metrics;
        mediaGrid._updateMetrics({ hard: true });
        metrics = mediaGrid.metrics;
        assert.strictEqual(metrics.gutter, 10, 'It bases gutter on item margin sizes.');
        assert.strictEqual(metrics.itemWidth, 200, "It uses the item's 'outerWidth' as width.");
        assert.strictEqual(metrics.rowSize, 2, 'It bases row size on item and wrap sizes.');
        assert.strictEqual(metrics.colSize, 2, 'It bases column size on row size.');
        style.width = '620px';
        mediaGrid._updateMetrics({ hard: true });
        metrics = mediaGrid.metrics;
        assert.strictEqual(metrics.rowSize, 3, 'It bases row size on item and wrap sizes.');
        assert.strictEqual(mediaGrid.selectAllByClass('samples').length, 1,
          'It cleans up after multiple hard updates.');
      });
      QUnit.start();
      return true;
    }

    // ---

    let tests = [];
    const { createVisualTest, placeholderText, runVisualTests } = base;
    const { className, eventName } = MediaGrid;
    tests.push(createVisualTest({
      label: 'by default',
      template({ placeholderText }) {
        const tagsHTML = (
`<ul class="mg-tags">
  <li><a href="#">foo</a></li>
  <li><a href="#">bar</a></li>
  <li><a href="#">baz</a></li>
</ul>`
        );
        const title = placeholderText.title.toUpperCase();
        let html = '<div class="test-body mg-bleed mg-theme-folio">';
        let i = 12;
        do {
          html += (
`<article class="js-mg-item">
  <section class="mg-preview">
    <img src="http://placehold.it/200x134/888/aaa" alt="preview thumbnail">
    <div class="mg-headings">
      <h1 class="mg-title">${title}</h1>
      <h2 class="mg-date">July 2012</h2>
    </div>
    ${tagsHTML}
  </section>
  <section class="mg-detail">
    <img src="http://placehold.it/418x280/888/aaa" alt="main banner">
    <div class="mg-headings">
      <h1 class="mg-title">${title}</h1>
      <h2 class="mg-date">July 2012</h2>
    </div>
    <p>${placeholderText.short}</p>
    ${tagsHTML}
  </section>
</article>`
          );
        } while ((i -= 1));
        html += '</div>';
        return html;
      },
      footerHtml: '<button name="list-append">load more</button>',
      test(testElement) {
        let mediaGrid = MediaGrid.extend(testElement.querySelector('.test-body'));
        const { load } = mediaGrid;
        return mediaGrid.createPreviewImagesPromise().then(load, load);
      },
      anchorName: 'default',
      className: 'default-call',
      vars: { placeholderText },
      beforeTest(testElement) {
        testElement.addEventListener(eventName('ready'), (_) => {
          createVisualTest.setupAppendButton({
            testElement,
            listSelector: '.test-body',
            itemSelector: 'article:last-of-type',
            onAppend(newElement) {
              newElement.classList.add(className('raw'));
            },
          });
        });
      },
    }));
    runVisualTests(tests);
  });

}());
