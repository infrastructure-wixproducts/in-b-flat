define([
  'jquery',
  'lodash',
  'mediaUtils',
  'randomColor'
], function($, _, mediaUtils, randomColor) {

  var _randomColor = new randomColor;
  var container;
  var audioElements = [];
  var controls;
  var autoplayControl;
  var autoplayText;
  var autoplayIcon;
  var autoplaying = false;
  var autoplayTrackCount = 5;
  var durations = [ // `afinfo audio/*.mp3 | grep duration`
    136.907755,
    125.805688,
    119.719184,
    97.985306,
    107.284898,
    120.320000,
    118.099592,
    133.616327,
    107.859592,
    126.249796,
    95.582041,
    121.286531,
    110.889796,
    96.365714,
    111.621224,
    138.657959,
    91.036735,
    112.561633,
    103.888980,
    108.486531
  ];
  var averageDuration = _.reduce(durations, function(x, y) { return x + y; }) / durations.length;
  // Delay between the triggering of the next audio asset
  var autoplayDelay = (averageDuration / autoplayTrackCount) * 1000;
  var autoplayTimeoutID;


  var insertElements = function() {
    audioElements = _.map(_.range(1, 21), function(number) {
      var element = $(
        '<div class="audio-element" style="background-color: ' + _randomColor.get(true) + '">' +
          '<span class="number">' +
            number +
          '</span>' +
          '<audio>' +
            '<source src="audio/' + number + '.mp3">' +
            '<source src="audio/' + number + '.ogg">' +
          '</audio>' +
        '</div>'
      );

      container.append(element);

      return element;
    });
  };

  var preloadElements = function() {
    _.each(audioElements, function(element) {
      var audio = element.find('audio');
      audio.get(0).load();
    });
  };

  var playAudioElement = function(element) {
    element.addClass('playing');

    var audio = element.find('audio');

    audio.on('ended', function() {
      element.removeClass('playing');
    });

    mediaUtils.play(audio);
  };

  var stopAudioElement = function(element) {
    element.removeClass('playing');

    var audio = element.find('audio');

    mediaUtils.stop(audio);
  };

  var startAutoPlay = function() {
    var elements = _.sample(audioElements, autoplayTrackCount);

    _.each(elements, playAudioElement);

    var autoplayDelayedTrigger = function() {
      var playableElements = _.filter(audioElements, function(element) {
        return !element.is('.playing');
      });

      if (playableElements.length) {
        var element = _.sample(playableElements);
        playAudioElement(element);
      }

      autoplayTimeoutID = setTimeout(autoplayDelayedTrigger, autoplayDelay);
    };

    autoplayTimeoutID = setTimeout(autoplayDelayedTrigger, autoplayDelay);
  };

  var stopAutoPlay = function() {
    _.each(audioElements, stopAudioElement);
    clearTimeout(autoplayTimeoutID);
  };

  var autoplayToggle = function() {
    if (!autoplaying) {
      startAutoPlay();
      autoplayText.text('Stop');
    } else {
      stopAutoPlay();
      autoplayText.text('Play');
    }

    autoplayIcon
      .toggleClass('fa-play')
      .toggleClass('fa-stop');

    autoplaying = !autoplaying;
  };

  var setBindings = function() {
    container.on('click', '.audio-element', function() {
      var element = $(this);
      if (element.hasClass('playing')) {
        stopAudioElement(element);
      } else {
        playAudioElement(element);
      }
    });

    autoplayControl.on('click', autoplayToggle);
  };

  var init = function() {
    container = $('.audio-container');
    controls = $('.controls');
    autoplayControl = controls.find('.autoplay');
    autoplayText = autoplayControl.find('.text');
    autoplayIcon = autoplayControl.find('.icon');

    insertElements();
    preloadElements();
    setBindings();
  };

  return {
    init: init
  };

});