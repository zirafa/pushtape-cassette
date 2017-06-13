#!/usr/local/bin/python

###  PUSHTAPE DUB.PY
#
# This script recursively searches through files and folders in the working directory
# and generates cassette.json as well as any necessary tracklist.jspf files.
# The .jspf files are stored in _data and the music directories are left untouched.
# NOTE: Any existing cassette.json or .jspf files will be overwritten.
#
### SETUP 
# Place each music release in its own folder under /releases, with an optional artwork.jpg and notes.md file.
#
#  releases/example-release
#      - 01 Intro.mp3
#      - 02 Outro.mp3
#      - notes.md
#      - artwork.jpg
# 
# You can optionally specify the artist using a subfolder structure, i.e. releases/artist-name/album-title.
# 
#  releases/artist-name/another-release
#      - 01 Intro.mp3
#      - 02 Intermission.wav
#      - 03 Outro.mp3
#      - notes.md
#      - artwork.jpg 
#
# Place static page files in /pages:
#
#   pages/about.md
#   pages/shows.md
#
### RUN SCRIPT 
# To run the script locally, on the command line navigate to your pushtape directory and run the build script:
#     cd pushtape-cassette
#     python dub.py
#
# To run the script as a CGI server script:
# - Set this file's permission to 755 (may need to move it to cgi-bin)
# - In .htaccess: Addhandler cgi-script .py .pl .cgi
# - Set verbose_output below to False and make sure default_walk_dir is your pushtape directory
# Read more: https://docs.python.org/2/library/cgi.html

import os
import sys
import json
import datetime
import re

# Cleanup common numeric prefixes, i.e. 01 Deadweight.mp3 becomes Deadweight
cleanup_names = True

# Show detailed output about the scripts 
verbose_output = False

# Default working directory path if none specified 
default_walk_dir = '.'

# If no argument passed, assume default working directory path
if len(sys.argv) >= 2:
  walk_dir = sys.argv[1]
else:
  walk_dir = default_walk_dir

# Output directory 
output_dir = os.path.join(walk_dir, '_data')
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    
# Path to cassette.json - @@TODO: move cassette.json to _data?
cassette_path = os.path.join(walk_dir, 'cassette.json')

# Path to /releases and /pages
releases_dir = os.path.join(walk_dir, 'releases')
pages_dir = os.path.join(walk_dir, 'pages')

print "\n\n"
print "::::::::::::::::::::::::::::::::::"
print "::    Pushtape Cassette Dub     ::"
print "::::::::::::::::::::::::::::::::::"
if (verbose_output):  
  print "This script will generate relevant tracklist.jspf files and a cassette.json using files and folders found in the working directory: " + walk_dir
  print "Each music release must be in a separate folder inside of " + releases_dir
  print "Each page should be a markdown file (.md) and placed inside of " + pages_dir

# os.walk reference: https://stackoverflow.com/questions/2212643/python-recursive-folder-read
# for root, subdirs, files in os.walk(releases_dir):
#    root: Current path which is "walked through"
#    subdirs: Files in root of type directory
#    files: Files in root (not in subdirs) of type other than directory

# Walk the releases directory and output tracklist.jspf files
releases = {}
for root, subdirs, files in os.walk(releases_dir):
    if (verbose_output):
      print('--\nDirectory: ' + root)
    
    current_dir = os.path.basename(root)
    if (os.path.exists(os.path.join(current_dir, 'tracklist.jspf'))):
      tracklist_file_path = os.path.join(current_dir, 'tracklist.jspf')
    else:
      tracklist_file_path = os.path.join(output_dir, current_dir + '-tracklist.jspf')
    tracklist_file_relpath = os.path.relpath(tracklist_file_path)

    # for subdir in subdirs:
    #  print('\t- subdirectory ' + subdir)
    notes_path = ''
    artwork_path = 'assets/images/default-artwork.jpg'
    
    # Use this folder pattern if you want to include an artist name
    # releases/artist/album
    if (os.path.dirname(root) != releases_dir):
      artist = os.path.basename(os.path.dirname(root))
    else:
      artist = ''
    
    tracks = []    
    for filename in files:
        file_path = os.path.join(root, filename)
        file_relpath = os.path.relpath(file_path)

        # Split the extension from the path and normalise it to lowercase.
        ext = os.path.splitext(filename)[-1].lower()
        title = os.path.splitext(filename)[0].lower()
        if (cleanup_names):
          title = re.sub('^\d{1,2} ', '', title)
        if ext == ".mp3" or ext == ".wav":
          with open(file_path, 'rb') as f:
            if (verbose_output):
              print('\t- Found file: %s (full path: %s)' % (filename, file_relpath))
            track = {}
            track['location'] = str(file_relpath)
            track['title'] = str(title)
            if len(artist) > 0:
              track['creator'] = artist
            tracks.append(track)
        if filename == "notes.md":
          notes_path = file_relpath
          if (verbose_output):
            print('\t- Found notes: %s (full path: %s)' % (filename, file_relpath))
        if filename == "artwork.jpg" or filename == "folder.jpg" or filename == "artwork.png" or filename == "folder.png":
          artwork_path = file_relpath
          if (verbose_output):
            print('\t- Found artwork: %s (full path: %s)' % (filename, file_relpath))       
  
          
    if len(tracks) > 0 and root != releases_dir:
      with open(tracklist_file_path, 'wb') as tracklist_file:
      
        release = {}
        http_path = ''
        if len(artist) > 0:
          release['title'] = str(current_dir)
          # Uncomment for "Title by Artist" format
          # release['title'] = str(current_dir) + " by " + str(artist)
          http_path = str(artist).replace(" ", "-").lower() + "/" + str(current_dir).replace(" ", "-").lower() 
        else:
          release['title'] = str(current_dir)
          http_path = str(current_dir).replace(" ", "-").lower()
        release['playlist'] = str(tracklist_file_relpath)
        if os.path.exists(artwork_path):
          release['artwork'] = artwork_path
        if os.path.exists(notes_path):
          release['notes'] = notes_path
        releases[http_path] = release
        
        # Write to tracklist file
        playlist = {'playlist' : {}}
        playlist['playlist']['title'] = str(current_dir)
        if len(artist) > 0:
          playlist['playlist']['creator'] = str(artist)
        playlist['playlist']['track'] = tracks
        json.dump(playlist, tracklist_file, sort_keys=True, indent=2, separators=(',', ': '))
        if (verbose_output):
          print "Wrote to: " + tracklist_file_path
    
# Walk the pages directory to find pages
pages = {}
for root, subdirs, files in os.walk(pages_dir):
  for filename in files:
    file_path = os.path.join(root, filename)
    file_relpath = os.path.relpath(file_path)
    ext = os.path.splitext(filename)[-1].lower()
    title = os.path.splitext(filename)[0]
    if (cleanup_names):
      title = re.sub('^\d{1,2} ', '', title)
    if ext == ".md":
      if (verbose_output):
        print('Found page: %s (full path: %s)' % (filename, file_relpath))
      pages[title] = {'location' : file_relpath, 'title' : title }

# Releases is a special case
pages['releases'] = {}
      
cassetteJSON = {}
cassetteJSON['lastBuild'] = str(datetime.datetime.utcnow())
cassetteJSON['pages'] = pages
cassetteJSON['releases'] = releases

# Output to cassette.json
with open(cassette_path, 'wb') as f:
  json.dump(cassetteJSON, f, sort_keys=True, indent=2, separators=(',', ': '))
  print "*** " + str(cassetteJSON['lastBuild']) + " ***"
  print "Total of "+ str(len(pages) - 1) + " pages found."
  print "Total of " + str(len(releases)) + " releases found."  
  if (verbose_output):
    print "Wrote to: " + cassette_path
  print "...all done!\n"
  