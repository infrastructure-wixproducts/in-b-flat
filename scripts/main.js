require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    lodash: '../bower_components/lodash/dist/lodash',
    mediaUtils: 'lib/media-utils',
    randomColor: 'lib/random-color'
  }
});

require([
  'jquery',
  'app/main'
], function($, app) {
  $(app.init);
});