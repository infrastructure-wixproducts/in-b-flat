define([
  'jquery'
], function($) {

  var states = {
    fadeIn: 'fade-in',
    fadeOut: 'fade-out'
  };

  var defaultOptions = {
    duration: 500,
    stepDelay: 20,
    volumeMax: 1,
    volumeMin: 0
  };

  var _unwrapElement = function(element) {
    if (element.jquery) {
      return element.get(0);
    }
    return element;
  };

  var load = function(element) {
    element = _unwrapElement(element);
    if (element.readyState !== 4) {
      var originalVolume = element.volume;
      element.volume = 0;
      element.play();
      element.pause();
      element.volume = originalVolume;
      element.currentTime = 0;
    }
  };

  var isLoaded = function(element) {
    return element.readyState === 4
  };

  var play = function(element) {
    element = _unwrapElement(element);
    load(element);

    if (!element.paused) {
      // Already playing
      return;
    }

    if (!isLoaded(element)) {
      $(element).on('canplaythrough', function() {
        play(element);
      });
    }

    fadeIn(element);
  };

  var pause = function(element, callback) {
    element = _unwrapElement(element);

    element.pause();

    fadeOut(element, {
      duration: 10,
      callback: callback
    });
  };

  var stop = function(element) {
    element = _unwrapElement(element);
    pause(element, function() {
      element.currentTime = 0;
    });
  };

  var _getStepAmount = function(options) {
    if (!options) {
      options = defaultOptions;
    }
    return options.stepDelay / options.duration;
  };

  var fadeIn = function(sound, options) {

    options = _.extend(_.clone(defaultOptions), options);

    sound.__mediaUtilsState__ = states.fadeIn;
    sound.volume = 0;

    var stepAmount = _getStepAmount(options);

    if (sound.paused || sound.readyState == 4) {
      sound.play();
    }

    var _fadeIn = function(sound, options) {
      if (sound.__mediaUtilsState__ !== states.fadeIn) {
        return;
      }
      var vol = sound.volume;
      if (vol < options.volumeMax) {
        sound.volume = Math.min(options.volumeMax, vol + stepAmount);
        sound.timer = setTimeout(function() {
          _fadeIn(sound, options);
        }, options.stepDelay);
      } else {
        delete sound.__mediaUtilsState__;
      }
    };

    _fadeIn(sound, options);
  };

  var fadeOut = function(sound, options) {

    options = _.extend(_.clone(defaultOptions), options);

    sound.__mediaUtilsState__ = states.fadeOut;

    var stepAmount = _getStepAmount(options);

    var _fadeOut = function(sound, options) {
      if (sound.__mediaUtilsState__ !== states.fadeOut) {
        return;
      }
      var vol = sound.volume;
      if (vol > options.volumeMin) {
        sound.volume = Math.max(options.volumeMin, vol - stepAmount);
        sound.timer = setTimeout(function() {
          _fadeOut(sound, options);
        }, options.stepDelay);
      } else {
        sound.pause();
        delete sound.__mediaUtilsState__;
        if (options.callback) {
          options.callback();
        }
      }
    };

    _fadeOut(sound, options);
  };

  return {
    load: load,
    isLoaded: isLoaded,
    play: play,
    pause: pause,
    stop: stop,
    fadeIn: fadeIn,
    fadeOut: fadeOut
  };
});