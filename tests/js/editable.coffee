
# See [tests](../../../tests/editable.visual.html)

require.config
  baseUrl: '../lib'
  paths:
    hlf: '../dist'
    test: '../tests/js'

require [
  'jquery'
  'underscore'
  'test/base-visual'
  'hlf/jquery.hlf.editable'
], ($, _) ->

  shouldRunVisualTests = $('#qunit').length is 0
  return false unless shouldRunVisualTests
  tests = []

  # Default
  # -------
  # Basic test with the default settings.
  tests.push $.visualTest

    label: 'inline type',
    template:
      """
      <div class="box">
        <fieldset data-hlf-editable='{
            "types": "inline"
          }'>
          <legend>Humanized Field Name</legend>
          <div class="js-text">Default value</div>
          <!-- If must be inline-block, set data-hlf-editable-display likewise. -->
          <div class="js-input" style="display: none">
            <input name="fieldName" type="text" />
          </div>
        </fieldset>
      </div>
      """
    test: ($context) ->
      $context.find '[data-hlf-editable]'
        .editable()
        .on 'commit.hlf.editable', (e) ->
          # Update data source here.
          $(@).editable 'update', { text: e.userInfo.text }

    anchorName: 'default'
    className: 'default-call'

  $ -> test() for test in tests
