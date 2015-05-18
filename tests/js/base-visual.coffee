###
Visual Test Helpers
===================
This is a developer-level API for writing UI tests. Plugin users need not read
further.
###

define [
  'jquery'
  'underscore'
], ($, _) ->

  # $.visualTest
  # ------------

  # The test function generator. Invoke tests on document ready.
  # Configuration:
  # 
  # - `label` - header text describing the test topic.
  # - `className` - a hook for any custom css.
  # - `footerHtml` - optional html for controls for additional testing.
  $.visualTest = (config) ->
    ->
      # - Ensure config.
      config.vars ?= {}
      # - Build test template vars.
      vars = _.pick config, 'label', 'className', 'footerHtml'
      vars.footerHtml ?= '' unless config.asFragments
      vars.docsUrl = $('body > header [data-rel=docs]').attr('href') + "##{config.anchorName}"
      vars.html = _.template config.template, config.vars
      # - Render test to get test context (or fragments).
      $container = if config.asFragments then $('body') else $('#main')
      opts = { template: '<%= html %>' } if config.asFragments
      $test = $container.renderVisualTest vars, opts
      if config.asFragments
        $container.addClass config.className if config.className?
        $test = $test.addClass 'visual-test-fragment'
                     .filter '.visual-test-fragment'
      # - Run tests.
      config.beforeTest $test if config.beforeTest?
      config.test $test

  # Helpers for additional setup.
  _.extend $.visualTest,
    # A button for appending an item to a list.
    # This should be included as part of `footerHtml`.
    setupAppendButton: ($context, listSelector, updateItem) ->
      $list = $context.find listSelector
      $item = $list.children(':last-child').clone()
      $context.find('[name=list-append]').click ->
        $newItem = $item.clone()
        $list.append $newItem
        updateItem $newItem if updateItem?

  # Simple method for an element to render and append a test. Only provide a
  # custom template if absolutely needed.
  $.fn.renderVisualTest = (vars, opts) ->
    opts ?= {}
    _.defaults opts, $.fn.renderVisualTest.defaults
    opts.template = _.template opts.template if _.isString(opts.template)
    $test = $ opts.template vars 
    @.append $test
    $test

  $.fn.renderVisualTest.defaults =
    template: _.template """
              <section class="<%- className %> visual-test">
                <header>
                  <span class="label"><%- label %></span>
                  <a data-rel="docs" href="<%= docsUrl %>">docs</a>
                </header>
                <%= html %>
                <footer><%= footerHtml %></footer>
              </section>
              """

  # $.loremIpsum
  # ------------

  loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
     incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
     nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
     Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
     fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
     culpa qui officia deserunt mollit anim id est laborum."

  $.loremIpsum = 
     long: loremIpsum
     short: loremIpsum[...200]

  yes