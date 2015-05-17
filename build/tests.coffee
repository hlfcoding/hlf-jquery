grunt = require 'grunt'

module.exports =

  qunit:
    all:
      expand: yes
      src: 'tests/*.unit.html'

  autoprefixer:
    options:
      map: yes
    expand: yes
    src: 'tests/**/*.css'
    ext: '.css'
    extDot: 'last'

  coffee:
    options:
      sourceMap: yes
    expand: yes
    src: 'tests/**/*.coffee'
    ext: '.js'
    extDot: 'last'

  sass:
    expand: yes
    src: 'tests/**/*.scss'
    ext: '.css'
    extDot: 'last'

  task: ->
    grunt.registerTask 'test', [
      'coffee:tests'
      'sass:tests'
      'autoprefixer:tests'
      'qunit'
    ]
