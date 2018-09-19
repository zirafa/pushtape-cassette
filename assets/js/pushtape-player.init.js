/**
 * Initialize Pushtape Player
 */
var pushtapePlayer = null; // Instance
soundManager.setup({
  debugMode: false,   // disable or enable debug output
  url: 'assets/js/swf/',       // path to directory containing SM2 SWF
  useHighPerformance: true, // keep flash on screen, boost performance
  preferFlash: false, // for visualization effects (smoother scrubber)
  flashVersion: 9,
  wmode: 'transparent', // transparent SWF, if possible
  onready: function() {
    // Initialize pushtape player when SM2 is ready
    pushtapePlayer = new PushtapePlayer();
    pushtapePlayer.init({
      playNext: true, // stop after one sound, or play through list until end
      autoPlay: false,  // start playing the first sound right away
      repeatAll: false, // repeat playlist after last track
      containerClass : 'js-content', // If empty, scan entire page for audio links. If set, limits the scope of search inside containerClass
      autoScan : true, // Automatically observe changes to container and scan for new links to add to playlist
      linkClass : '', // By default, add all links found. If set, will only add links with this class 
      addControlsMarkup: {
        'enabled' : false,
        'controlsContainerClass' : 'pt-controls-markup'
      } // If enabled =  false (the default) you provide all markup in your HTML, otherwise set this to true and it will be dynamically inserted into controlsContainerClass.
    });
  },
  ontimeout: function() {
    // Could not start. Missing SWF? Flash blocked? Show an error, etc.?
    console.log('Error initializing the Pushtape player.');
  }  
});
