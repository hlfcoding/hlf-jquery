//
// HLF Hover Intent Extension
// ==========================
// [Tests](../../tests/js/hover-intent.html)
//
// The `HoverIntent` extension normalizes DOM events associated with mouse enter
// and leave interaction. It prevents the 'thrashing' of attached behaviors (ex:
// non-cancel-able animations) when matching mouse input arrives at frequencies
// past the threshold. It is heavily inspired by Brian Cherne's jQuery plugin of
// the same name (github.com/briancherne/jquery-hoverIntent).
//
(function(root, attach) {
  if (typeof define === 'function' && define.amd) {
    define(['hlf/core'], attach);
  } else if (typeof exports === 'object') {
    module.exports = attach(require('hlf/core'));
  } else {
    attach(HLF);
  }
})(this, function(HLF) {
  'use strict';
  //
  // HoverIntent
  // -----------
  //
  // - __interval__ is the millis to wait before deciding intent. `300` is the
  //   default to reduce more thrashing.
  //
  // - __sensitivity__ is the pixel threshold for mouse travel between polling
  //   intervals. With the minimum sensitivity threshold of 1, the mouse must
  //   not move between intervals. With higher values yield more false positives.
  //   `2` is the default.
  //
  // The events dispatched are the name-spaced `enter` and `leave` events. They
  // try to match system mouse events where possible and include values for:
  // `pageX`, `pageY`, `relatedTarget`.
  //
  // To summarize the implementation, the `_onMouseOver` handler is the start of
  // the intent 'life-cycle', with state being the default (via `_resetState`).
  // It records the mouse coordinates, sets up a delayed intent check, which is
  // one of the possible updates done by `_updateState`, and is based on the
  // distance traveled since `_timeout` was set. All event handlers guard
  // against unneeded checking, with `_onMouseOut` and `_onMouseOver` also using
  // `_checkEventElement` as a filter.
  //
  // Meanwhile, about every frame, the `_onMouseMove` handler tracks the current
  // mouse coordinates. If the `_onMouseOut` handler runs before the delayed
  // check, the check and subsequent behavior get canceled as state resets to
  // default. Otherwise, if the check of the stored mouse coordinates against
  // `sensitivity` passes, an `enter` event gets dispatched, ensuring a `leave`
  // event will too during `_onMouseOut`.
  //
  class HoverIntent {
    static get defaults() {
      return {
        interval: 300,
        sensitivity: 2,
      };
    }
    static toPrefix(context) {
      switch (context) {
        case 'event': return 'hlfhi';
        case 'data': return 'hlf-hi';
        default: return 'hlf-hi';
      }
    }
    constructor(elementOrElements, options, contextElement) {
      this.eventListeners = {
        'mousemove': [this._onMouseMove, { passive: true }],
        'mouseout': [this._onMouseOut, { passive: true }],
        'mouseover': [this._onMouseOver, { passive: true }]
      };
    }
    init() {
      this._resetState();
    }
    deinit() {
      this._resetState();
    }
    _checkEventElement(event) {
      const { relatedTarget, target, type } = event;
      if (type === 'mouseout' && target.contains(relatedTarget)) {
        return false;
      }
      if (this.contextElement) {
        if ([...this.elements].indexOf(target) === -1) { return false; }
        //this.debugLog(target, relatedTarget);
      } else {
        if (target !== this.rootElement) { return false; }
      }
      return true;
    }
    _dispatchHoverEvent(on, event) {
      const { mouse: { x, y } } = this;
      const { clientX, clientY, pageX, pageY, relatedTarget, target } = event;
      let type = on ? 'enter' : 'leave';
      target.dispatchEvent(this.createCustomEvent(type, {
        clientX, clientY,
        pageX: (x.current == null) ? pageX : x.current,
        pageY: (y.current == null) ? pageY : y.current,
        relatedTarget
      }));
      this.debugLog(type, pageX, pageY, Date.now() % 100000);
    }
    _dispatchTrackEvent(event) {
      event.target.dispatchEvent(this.createCustomEvent('track', {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
      }));
    }
    _onMouseMove(event) {
      this._updateState(event);
      requestAnimationFrame((_) => {
        if (this.intentional) {
          this.debugLog('track', event.pageX, event.pageY);
        }
        this._dispatchTrackEvent(event);
      });
    }
    _onMouseOut(event) {
      if (!this._checkEventElement(event)) { return; }
      let keepPosition = false;
      if (this.intentional) {
        keepPosition = true;
        this._dispatchHoverEvent(false, event);
      }
      this._resetState();
      if (keepPosition) {
        const { pageX, pageY } = event;
        let { mouse: { x, y } } = this;
        x.previous = pageX;
        y.previous = pageY;
      }
      this.debugLogGroup(false);
    }
    _onMouseOver(event) {
      if (this.intentional) { return; }
      if (this._timeout) { return; }
      if (!this._checkEventElement(event)) { return; }
      this.debugLogGroup();
      this._updateState(event);
      this.setTimeout('_timeout', this.interval, () => {
        this._updateState(event);
        if (this.intentional) {
          this._dispatchHoverEvent(true, event);
        }
      });
    }
    _resetState() {
      this.debugLog('reset');
      this.intentional = false;
      this.mouse = {
        x: { current: null, previous: null },
        y: { current: null, previous: null },
      };
      this.setTimeout('_timeout', null);
    }
    _updateState(event) {
      const { pageX, pageY } = event;
      if (event.type === 'mousemove') {
        let { mouse: { x, y } } = this;
        x.current = pageX;
        y.current = pageY;
        return;
      }
      let { mouse: { x, y } } = this;
      if (!this._timeout) {
        x.previous = pageX;
        y.previous = pageY;
        return;
      }
      const { pow, sqrt } = Math;
      let dMove;
      this.intentional = x.current == null || y.current == null;
      if (!this.intentional) {
        dMove = sqrt(
          pow(x.current - x.previous, 2) + pow(y.current - y.previous, 2)
        );
        this.intentional = dMove >= this.sensitivity;
      }
      this.debugLog('checked', dMove, this.sensitivity);
    }
  }
  HoverIntent.debug = false;
  HLF.buildExtension(HoverIntent, {
    autoBind: true,
    autoListen: true,
    compactOptions: true,
  });
  Object.assign(HLF, { HoverIntent });
  return HoverIntent;
});
