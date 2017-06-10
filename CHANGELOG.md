# Change Log
[Keep a changelog](http://keepachangelog.com/).

## [1.0.4] - 2017-6-9
### Updated
- Use a single global namespace to store app variables (settings, cassette, templates, etc)
- Move app settings out of cassette.json into index.html and application.js
- Fix CSS float problem for album images in breakpoints.css
### Added
- Python script (dub.py) that recursively scans for music and pages and generates cassette.json
- Default artwork (assets/images/default-artwork.jpg)


## [1.0.3] - 2017-4-18
### Updated
- Pushtape-player.js: adds keyboard shortcuts for playback (spacebar toggles play-pause, right/left arrow seeks 5 seconds)

## [1.0.2] - 2016-9-1
### Fixed
- Allow for global override of cassette path (define window.cassettePath before including application.js)

## [1.0.1] - 2016-8-23
### Added
- Support for JSONP

## [1.0.0] - 2016-8-9
### Added
- Initial release
