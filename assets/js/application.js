
var templates = {};

// Main menu list item
templates.menuItem = '<li><a href="{{pageName}}" data-navigo>{{pageName}}</a></li>';

// Pushtape Player controls markup
templates.playAll = '<a class="pt-play-all" href="#" title="Play/Pause"><span class="play-btn"><i class="fa fa-play"></i></span><span class="pause-btn"><i class="fa fa-pause"></i></span></a>';
  
(function ($) {
  "use strict";
  
  var cassette = {};

  // The following line disables browser caching
  $.ajaxSetup({ cache: false });
  
  // Fetch the cassette.json config file and store it in an object
  var cassetteXHR = $.getJSON('cassette.json', function(json){})
    .fail(function(json, status) {
      console.log('Fatal error. Could not load cassette.json.' + '(' + status + ')');
      console.log(json);
    });
  
  /**
   * Use XHR promise to store cassette.json as a JS object
   */
  cassetteXHR.done(function(json){
    cassette = json;
    var docTitle = document.title;
    
    /**
     * Setup data binding.
     * https://github.com/remy/bind.js
     */
    var binding = Bind({
      pages: cassette.hasOwnProperty('pages') ? Object.keys(cassette.pages) : '',
      contentHTML: ''
    }, {
      pages: {
        dom: '#main-menu',
        transform: function (value) {
          var variables = {
            pageName: this.safe(value),
          };
          var output = micromustache.render(templates.menuItem, variables);
          return decodeEntities(output);    
        }
      },
      contentHTML: {
        dom: '#content',
        transform: function (value) {
          // Run through markdown parser
          return marked(value);
        }
      }
    });
  
    // Pass root and other values based on cassette.json
    // Setup Router :: https://github.com/krasimir/navigo
    var router = new Navigo(null, !cassette.settings.cleanURLs);

    $('body').on('click', '.navigo-delegate', function(e){
      e.preventDefault();
      router.navigate(String($(this).attr('href')));
    });
    $('body').on('click', 'a[data-navigo], .navigo-delegate', function(e){
      $('#main-menu li a').removeClass('active');
      $(this).addClass('active');      
    });
    $('body').on('click', '.mobile-menu-toggle', function(){
      $('#main-menu').toggleClass('hide');  
    });
    
     
    /**
     *
     * Callback function that handles both release and track routes
     * 
     * @params params passed through the navigo router
     * 
     * @return HTML markup
     */
    var releaseMarkup = function(params) {
      window.scrollTo(0, 0);
      var markup = {'title': decodeURI(params.title), 'artwork':'', 'tracklist': '', 'notes':''};
      var release = cassette.releases[decodeURI(params.title)];
      var playlist;
      var releaseURL = 'release/' + params.title;
      var jqxhr = $.getJSON(release.playlist, function() {
        
      })
      .done(function(json) {
          playlist = json.playlist;
          var creator = '';
          // Uncomment the following to show the playlist's creator
          /*
          if (playlist.hasOwnProperty('creator')) {
            creator = '<span class="creator">' + playlist.creator + '</span>';
          }
          */
          if (playlist.hasOwnProperty('title') && playlist.title.length > 0) {
            markup.title = '<h1 class="title">'+ templates.playAll +' <a class="navigo-delegate" href="'+ releaseURL +'">'+ playlist.title + creator + '</a></h1>\n';
          }
          else {
            markup.title = '<h1 class="title">'+ templates.playAll +' <a class="navigo-delegate" href="'+ params.title +'">'+ playlist.title + creator + '</a></h1>\n';
          }
          if (release.hasOwnProperty('artwork') && release.artwork.length > 0) {
            markup.artwork += '<div class="artwork"><img src="' + release.artwork + '"/></div>';
          }
          if (playlist.hasOwnProperty('track') && playlist.track.length > 0) {
            var trackId = 0;
            markup.tracklist = '<ul class="tracklist pt-list">';
            $.each(playlist.track, function(index, value){
              var artist = '';
              if (value.hasOwnProperty('creator')) {
                artist = '<span class="artist">' + value.creator + '</span>';    
              }
              if (params.hasOwnProperty('trackNumber') && params.trackNumber == trackId) {
                 markup.tracklist += '<li class="highlight"><a data-pushtape-permalink = "release/' + params.title + '/track/'+trackId+'" data-pushtape-sound-id ="'+ params.title +'_'+ trackId +'" href="'+ value.location + '">' + value.title + artist + '</a></li>\n';
              }
              else {
                markup.tracklist += '<li><a data-pushtape-permalink = "release/' + params.title + '/track/'+trackId+'" data-pushtape-sound-id ="'+ params.title +'_'+ trackId +'" href="'+ value.location + '">' + value.title + artist + '</a></li>\n';
              }
              trackId++;
            });
            markup.tracklist += '</ul>';
          }
          document.title = docTitle + ' | ' + stripTags(markup.title);             
          binding.contentHTML = markup.title + markup.artwork  + markup.tracklist;
          if (release.hasOwnProperty('notes')) {
            var jqxhr = $.get(release.notes)
              .done(function(data) {
                markup.notes += marked(data);
                binding.contentHTML += markup.notes;  
              });
          }
      });   
    }      

    /**
     *
     * Callback function that handles release landing page markup
     * 
     * @params releaseTitle title of individual release
     * 
     * @return HTML markup
     */
    var allReleasesMarkup = function(releaseTitle) {
      window.scrollTo(0, 0);
      var markup = {'title': decodeURI(releaseTitle), 'artwork':''};
      var release = cassette.releases[decodeURI(releaseTitle)];
      var playlist;
      var releaseURL = 'release/' + releaseTitle;
      if (release.hasOwnProperty('title')) {
        markup.title = release.title;  
      }
      markup.artwork += '<div class="artwork thumbnail"><img src="' + release.artwork + '"/></div>';
      return '<a class="release navigo-delegate" href="'+ releaseURL +'">' + markup.artwork + '<h3 class="release-title">' + markup.title + '</h3>' + '</a>';
    }  
    
    
    // Setup static pages as first level routes
    var pages = {};
    $.each(cassette.pages, function(index, value) {
      pages[String(index)] = function(){
        var jqxhr = $.get(value.location)
          .done(function(data) {
            window.scrollTo(0, 0);
            binding.contentHTML = data;
            document.title = docTitle + ' | ' + decodeURI(index);
            $('#main-menu li a').removeClass('active');
            $('a[href="' + String(index) + '"]').addClass('active');
          })
          .fail(function(data, status) {
            binding.contentHTML = '<h1>Error</h1> Problem loading page. (' + status + ')';
          })
          .always(function() {
          });  
      }
    });
    // Setup releases landing page
    pages['releases'] = function(params) {
      if (cassette.hasOwnProperty('releases') && Object.keys(cassette.releases).length > 0) {
        var markup = '<ul class="release-list">\n';
        $.each(Object.keys(cassette.releases), function(index, value) {
          markup += '<li>' + allReleasesMarkup(value) + '</li>\n';
        });
        markup += '</ul>\n';
        binding.contentHTML = markup;
      }
      else {
        binding.contentHTML = '<h1>:-/</h1> No releases were found.';
      }
      document.title = docTitle + ' | ' + 'releases';
      $('#main-menu li a').removeClass('active');
      $('a[href="releases"]').addClass('active');
    }    
    // Setup routes for releases
    pages['release/:title/track/:trackNumber'] = function (params) {
      releaseMarkup(params);       
    }    
    // Setup routes for releases
    pages['release/:title'] = function (params) {
      releaseMarkup(params);      
    }
    // Setup wildcard route for static pages and homepage
    pages['*'] = function(params) {
      if (cassette.settings.homePage.length > 0) {
        router.resolve(String(cassette.settings.homePage));
        $('a[href="' + cassette.settings.homePage + '"]').addClass('active');
      }
      else {
        // No page specified, try loading a default
        router.resolve('releases');
      }
    }
    router.on(pages).resolve();
  });

  /**
   * Sanitize HTML output
   */
  var decodeEntities = function(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }
  
  /**
   * Convert HTML to plain text
   * 
   * @param dirtyString 
   * @return plain text string
   */
  var stripTags = function(dirtyString) {
    return $("<div/>").html(dirtyString).text();
  }

})(jQuery);