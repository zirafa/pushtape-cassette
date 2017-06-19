# Pushtape Cassette

Pushtape Cassette is a lightweight framework for building better music web applications. Make a cassette of your music and render a complete music web app in seconds, featuring a persistent music player.
### [Demo](http://www.pushtape.com/demo/cassette)

![Screenshot](https://i.imgur.com/yX9G4cbh.png)


## About

This project allows you to create static music webapps that can be integrated with any number of backend technologies: flat files, Wordpress/Drupal, JS Frameworks, Python, and Ruby. The key element that powers this idea is the cassette.json file, a [portable discography format](https://github.com/zirafa/discography-yaml). This file acts like a single comprehensive endpoint - and from that single point, javascript is used to create a single-page-application framework using various micro-libraries. 

# Quick Start

- Unzip all files to the document root on your web server. Check the base URL tag in index.html and build cassette.json.

## Base URL

If you run the app from a subdirectory from document root, in index.html change the base tag to:
```
  <base href="/subdirectory/" />
```
or alternatively load all assets using absolute paths.

## Cassette.json

- Build cassette.json by manually editing the file or run the build script.

- Run the build script to automatically scan the working directory for music and pages and generate cassette.json:
```
$ cd pushtape-cassette
$ python dub.py
```

### Dub.py

Dub.py is a python script that will automatically generate a cassette.json based on the files in your working directory. It is intended to be run locally on the command line, but if your server is [configured to run python scripts](https://docs.python.org/2/library/cgi.html) you can try running it from the browser or setup a crontab.
Notes:
- This script recursively searches through files and folders in the working directory and generates cassette.json as well as any necessary tracklist.jspf files.
- The .jspf files are stored in _data and the music directories are left untouched.
- You can use subfolders to organize releases by artist, i.e. ```releases/artist-name/release-name``` 
- If no artwork file is found, assets/images/default-artwork.jpg will be used.

### Clean URLS
If you want to remove the hash # from the URL routes and use History API instead, in index.html set app.settings.cleanURLs to true. Note that running the app with History API enabled from document root is encouraged as it takes care of all relative link issues.

## Flat File Example

Note: you can skip steps 3 and 4 if you use the dub.py build script.

1. Add static pages by creating [markdown](https://daringfireball.net/projects/markdown/) files in the /pages directory, each file should have the .md extension.
2. Add your music in the /releases directory. Place each release in its own directory, i.e. /releases/release-title or /releases/artist/release-title
  - Add liner notes by including a notes.md markdown file
  - Add artwork by including an artwork.jpg file (400x400 size is recommended)
  - Add MP3s or gather a list of remote MP3 URLs (128kbps - 320kbps CBR MP3 recommended)
3. Create a tracklist.jspf file for each release, which contains the order of the tracklist, metadata, and file locations (local or remote)
4. Build cassette.json with the URLs for your new pages and music. 
5. Visit your new static site. 

## Theme modifications

- The CSS is organized following SMACSS principles. You can find theme related files in /assets/css.
- The Bootstrap grid is included. Note that in index.html, the #content container div has Bootstrap's .container-fluid class applied. This means you can use .row and .col-* classes for any markup inside of that div.
- For full sized page background, look for the comments inside assets/css/theme/theme.css. 

# Advanced

## Cassette.json

Property | Type | Description
-------------- | ---- | ------------
lastBuild | timestamp | A way to track when the file was last built or modified.
pages | object | Contains key:value pairs for static pages on your site. The key defines the first level JS router path, i.e. 'about'. The value contains the URL location for a markdown document. The URL can be relative or absolute. If your server is returning documents using JSON/JSONP, set "format" : "json". If you need to include an external link and bypass the JS router, set "type" : "external".
releases | object | Contains key:value pairs defining the music releases available. A key defines the JS router path and should be all lower case with no spaces, i.e. album-title or artist/album-title. The fully generated path ends up being release/album-title or release/artist/album-title. The corresponding value defines the properties for this release. At a minimum you should specify the URL for artwork.jpg and notes.md (relative or absolute, optionally can specify format as json). The playlist property needs to be a path to a valid [JSPF](http://www.xspf.org/jspf/) playlist file, which specifies the track order and location of mp3 files, and any other metadata.

## App settings

Property | Type | Description
-------------- | ---- | ------------
app.settings.cassettePath | string | By default, application.js will load the local cassette.json path. You can override the path to cassette.json by setting this global variable before loading application.js.
app.settings.homePage | string | This value specifies what page should load by default. The path must be registered in the JS router.
app.settings.cleanURLs | boolean | If false, hash # urls are used. If true, the History API will handle clean URLs.


Known issues:
- The /releases path is a reserved JS route used to list all the available releases, and is the default homepage.
- In some instances local environments will not be able to load remote assets because of cross-origin request limitations. You may need to host those assets locally, otherwise running the web app on a web server should resolve any issues. If you further encounter problems, see the note about JSONP below.

Limitations:
- Because this project aims to present a static UX, you will likely run into limitations if you want more dynamic functionality. You can always try mixing dynamic assets into markdown, or for the more technically advanced you can try modifying application.js to suit your needs.

Example cassette.json:
```
{
  "lastBuild": {},
  "pages": {
     "releases" : {},
     "about" : {"location" : "pages/about.md"},
     "shows" : {"location" : "pages/shows.md"},
     "external-link" : {"title": "Soundcloud", "location" : "http://www.example.com", "type" : "external"}
  },
  "releases": {
    "example-release": {
      "title" : "Cosmic Voyage",
      "playlist" : "releases/example-release/tracklist.jspf",
      "artwork" : "releases/example-release/artwork.jpg",
      "notes" : "releases/example-release/notes.md"  
    },
    "example-release-two": {
      "title" : "Bird Life",
      "playlist" : "releases/example-release-two/tracklist.jspf",
      "artwork" : "releases/example-release-two/artwork.jpg",
      "notes" : "releases/example-release-two/notes.md"  
    }
  }
}
```

## Default Routes

URL Path | Description
-------- | -----------
/ | If no path is entered, the default homepage is loaded.
/[page-title] | This parses and displays the markdown for a page as defined in cassette.json.
/releases | A list of all releases with artwork and name, hyperlinked to the individual release page.
/release/[release-title]<br/>/release/[artist-name]/[release-title] | Displays all the information for a single release: artwork, playable tracklist, and notes.

## Troubleshooting

Problem | Steps
--- | ---
Blank page or missing CSS/JS | Double check your base url in index.html. If you have trouble figuring out the right path, sometimes the server path can be inferred using Chrome inspector.
Cross-origin request problems (remote content not loading) | When dealing with remote cross-origin requests valid JSONP must be returned and requests need to be formatted correctly. 1. You need to pass ?callback=? in the URL, i.e. http://example.com/cassette.json?callback=? 2: The response from the server must be JSONP, not just regular JSON. In particular, cross-origin issues may arise when remotely loading cassette.json, jspf, notes.md, and pages.md. Alternatively you can just load all assets locally to avoid having to setup a JSONP workaround.

## Why did I make this?

A lot of music sites are fairly static but have tricky frontend requirements. The best music UX allows for an uninterrupted music listening experience while performing other tasks such as reading liner notes, browsing other music, etc. Usually this means AJAXifying a traditional CMS/static site or building a complete solution from scratch using JS. This quickly becomes a headache to build and maintain, especially in the long term. By creating a decoupled frontend framework, it allows for better separation of concerns and lowers the long-term effort required to build and maintain a site. Additionally, by leveraging [JSPF](http://www.xspf.org/jspf/) and cassette.json, a [portable discography format](https://github.com/zirafa/discography-yaml), data portability is not an afterthought - it is built into the application from the beginning.

### Why JS micro-libraries? Why not Angular, Ember, etc?

I chose micro-libraries because the requirements for rendering a static music application are typically fairly modest, and I wanted to avoid reliance on a third party Single-Page-Application (SPA) framework. Additionally, because I used micro-libraries, it makes it easier to pick and choose what you want. For instance if you don't like the templating system, routing, or two-way binding libraries I chose, you can replace them with your preferred JS library/framework.

#### Micro-Libraries

- [Navigo.js - router](https://github.com/krasimir/navigo/)
- [Bind.js - two-way binding](https://github.com/remy/bind.js)
- [Marked.js - markdown parser](https://github.com/chjj/marked)
- [Micromustache.js - sub-implementation of the {{mustache}} template engine ](https://github.com/userpixel/micromustache)
- [Soundmanager2.js - crossplatform audio engine](https://github.com/scottschiller/SoundManager2)
- [Pushtape-player.js - customizable JS audio page player with global controls](https://github.com/zirafa/pushtape-player.js)
- [Bootstrap grid-only](https://github.com/zirafa/bootstrap-grid-only)

