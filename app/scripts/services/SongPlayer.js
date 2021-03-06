(function() {
     function SongPlayer($rootScope, Fixtures) {
          var SongPlayer = {};

          /**
          * @desc Private variable stores Buzz object audio file
          * @type {Object} currentBuzzObject
          */
          var currentBuzzObject = null;

          /**
          * @function setSong
          * @desc Private function that stops currently playing song and loads new audio file as currentBuzzObject
          * @param {Object} song
          */
          var setSong = function(song) {
            if (currentBuzzObject) {
                currentBuzzObject.stop();
                SongPlayer.currentSong.playing = null;
            }

            currentBuzzObject = new buzz.sound(song.audioUrl, {
                formats: ['mp3'],
                preload: true
            });

            currentBuzzObject.bind('timeupdate', function() {
                 $rootScope.$apply(function() {
                     SongPlayer.currentTime = currentBuzzObject.getTime();
                     if (currentBuzzObject.isEnded()) { // added autoplay feature so next song will automatically play until reaching final song in album
                         SongPlayer.next();
                     }
                 });
             });

            SongPlayer.currentSong = song;
            SongPlayer.setVolume(SongPlayer.volume); // added this call so that the volume does not reset after each song change

            if (SongPlayer.muted == true) { // added this conditional to maintain initial mute or unmute state when new song loads
                currentBuzzObject.mute();
            } else {
                currentBuzzObject.unmute();
            }
          };

          /**
          * @function playSong
          * @desc Private function that plays current song and sets playing attribute to 'true'
          * @param {Object} song
          */
          var playSong = function(song) {
            currentBuzzObject.play();
            song.playing = true;
          };

          /**
          * @function stopSong
          * @desc Private function that stops current song and sets playing attribute to 'null'
          * @param {Object} song
          */
          var stopSong = function(song) {
            currentBuzzObject.stop();
            song.playing = null;
          };

          /**
          * @function getSongIndex
          * @desc Private variable that stores index of current song in currentAlbum array
          * @param {Object} song
          * @return index of current song
          */
          var getSongIndex = function(song) {
             return currentAlbum.songs.indexOf(song);
          };

          /**
          * @desc Public variable storing current album
          * @type {Object} currentAlbum
          */
          var currentAlbum = Fixtures.getAlbum();

          /**
          * @desc Public variable stores current song title
          * @type {Object}
          */
          SongPlayer.currentSong = null;

         /**
         * @desc Public variable that stores current playback time (in seconds) of currently playing song
         * @type {Number}
         */
         SongPlayer.currentTime = null;

         /**
         * @desc Public variable that stores current volume of song
         * @type {Number}
         */
         SongPlayer.volume = 30;

         /**
         * @desc Public variable that stores the muted state of the currentBuzzObject
         * @type {Number}
         */
         SongPlayer.muted = false;

          /**
          * @function SongPlayer.play
          * @desc Public method sets and plays a new song if different song is playing, or plays the current song if paused, set playing attribute to 'true'
          * @param {Object} song
          */
          SongPlayer.play = function(song) {
             song = song || SongPlayer.currentSong || currentAlbum.songs[0];
             if (SongPlayer.currentSong !== song) {
                 setSong(song);
                 playSong(song);

              } else if (SongPlayer.currentSong === song) {
                 if (currentBuzzObject.isPaused()) {
                     playSong(song);
                 }
             }
         };

         /**
         * @function SongPlayer.pause
         * @desc Public method pauses current song, sets playing attribute to 'false'
         * @param {Object} song
         */
         SongPlayer.pause = function(song) {
             song = song || SongPlayer.currentSong;
             currentBuzzObject.pause();
             song.playing = false;
         };

         /**
         * @function SongPlayer.previous
         * @desc Public method that finds the previous song index in album and decrements currentSongIndex
         */
         SongPlayer.previous = function() {
             var currentSongIndex = getSongIndex(SongPlayer.currentSong);
             currentSongIndex--;

             if (SongPlayer.currentSong == null) { // added conditional to prevent error being thrown when user clicks 'previous' on page load before current song is loaded
                 return;
             }

             if (currentSongIndex < 0) {
                 stopSong(SongPlayer.currentSong);
             } else {
                 var song = currentAlbum.songs[currentSongIndex];
                 setSong(song);
                 playSong(song);
             }
         };

         /**
         * @function SongPlayer.next
         * @desc Public method that finds the next song index in album and increments currentSongIndex
         */
         SongPlayer.next = function() {
             var currentSongIndex = getSongIndex(SongPlayer.currentSong);
             currentSongIndex++;

             if (currentSongIndex === currentAlbum.songs.length) {
                 stopSong(SongPlayer.currentSong);
             } else {
                 var song = currentAlbum.songs[currentSongIndex];
                 setSong(song);
                 playSong(song);
             }
         };

         /**
         * @function setCurrentTime
         * @desc Public method that sets current time (in seconds) of currently playing song
         * @param {Number} time
         */
         SongPlayer.setCurrentTime = function(time) {
             if (currentBuzzObject) {
                 currentBuzzObject.setTime(time);
             }
         };

         /**
         * @function setVolume
         * @desc Public method that sets volume of currently playing song and updates public SongPlayer.volume variable
         * @param {Number} volume
         */
         SongPlayer.setVolume = function(volume) {
             currentBuzzObject.setVolume(volume);
             SongPlayer.volume = volume;
         };

         /**
         * @function mute
         * @desc Public method that mutes or unmutes current song based on state of public SongPlayer.muted variable
         */
         SongPlayer.mute = function() {
             if (currentBuzzObject == null ) { // prevents an error from being thrown when user attempts to mute a song before one has loaded
                 return;
             }

             if (SongPlayer.muted == false) {
                 currentBuzzObject.mute();
                 SongPlayer.muted = true;
             } else {
                 currentBuzzObject.unmute();
                 SongPlayer.muted = false;
             }
         };

         return SongPlayer;
    }

     angular
         .module('blocJams')
         .factory('SongPlayer', ['$rootScope', 'Fixtures', SongPlayer]);
 })();
