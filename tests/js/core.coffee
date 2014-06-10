require.config
  baseUrl: '../lib'
  paths:
    hlf: '../dist'
    test: '../tests/js'

require [
  'jquery'
  'underscore'
  'hlf/jquery.extension.hlf.core'
  'test/core.mixin'
], ($, _, hlf) ->
  shouldRunVisualTests = $('#qunit').length is 0

  if shouldRunVisualTests then $ ->
  else

    QUnit.module 'other'

    QUnit.test 'exports', (assert) ->
      assert.ok hlf,
        'Namespace should exist.'

    QUnit.test 'noConflict', (assert) ->
      assert.ok $.createPlugin,
        'Method shortcut for createPlugin should exist.'
      hlf.noConflict()
      assert.strictEqual $.createPlugin, undefined,
        'Method shortcut for createPlugin should be back to original value.'
      assert.ok hlf.createPlugin,
        'Original method for createPlugin should still exist.'

    QUnit.start()

  yes
