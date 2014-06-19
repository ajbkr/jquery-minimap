module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'bower_components/html2canvas/build/html2canvas.js',
          'js/jquery.minimap.js'
        ],
        dest: 'js/jquery.minimap.concat.js'
      }
    },

    uglify: {
      build: {
        src:  'js/jquery.minimap.concat.js',
        dest: 'js/jquery.minimap.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'concat',
    'uglify'
  ]);
};
