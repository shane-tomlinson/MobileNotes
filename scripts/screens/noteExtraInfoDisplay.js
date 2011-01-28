/**
* Extra info to display for a note.  Read only.
*
* @class MobileNotes.NoteExtraInfoDisplay
* @extends AFrame.DataForm
* @constructor
*/
MobileNotes.NoteExtraInfoDisplay = (function() {
    "use strict";
    
    var Display = function() {
        Display.sc.constructor.call( this );
    };
    AFrame.extend( Display, AFrame.DataForm, {
        init: function( config ) {
            config.dataSource = {};
            Display.sc.init.call( this, config );
        },
        
        setDataSource: function( dataSource ) {
            this.dataSource = AFrame.DataContainer( dataSource );
            
            this.dataSource.forEach( function( val, key ) {
                this.dataContainer.set( key, val );
            }, this );
        }
    } );

    return Display;
}() );