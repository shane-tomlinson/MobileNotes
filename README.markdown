MobileNotes
===========

This is a proof of concept using [AFrameJS](http://www.aframejs.com) to show how it can be used.  The idea is for devices that
support WebSQL or localStorage, use that as an offline storage mechanism so that notes can be stored locally.

MobileNotes makes use of the fantastic [persistenceJS library](https://github.com/zefhemel/persistencejs) from Zef Hemel.


MobileNotes is released under the Creative Commons Attribution-ShareAlike 3.0 License.
http://creativecommons.org/licenses/by-sa/3.0/



=====================
##Directory Structure##

    ./index.html             <-- Has the app HTML and templates
    ./images/                <-- Used for jQuery mobile images
    ./scripts/               <-- Javascript directory
          ext/               <-- External scripts
          fields/            <-- Field displays
          screens/           <-- Screen displays
          mobilenotes.js     <-- The main startup script
          noteDBAccess.js    <-- DB adapter to create models and save to WebSQL databases
          noteSchema.js      <-- The schema config for a note
    ./stylesheets/           <-- Where the stylesheets are


##To Run##
1. Download the latest code from [GitHub](http://www.github.com/stomlinson/MobileNotes).
2. Open up index.html

Copyright Shane Tomlinson 2011



Shane Tomlinson
set117 (show me a sign) yahoo.com
