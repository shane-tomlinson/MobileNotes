/**
* Tag Display for a note.  Read only.
*
* @class MobileNotes.TagDisplay
* @extends AFrame.Display
* @constructor
*/
MobileNotes.TagDisplay = (function() {
    "use strict";
    
    var Display = function() {
        Display.sc.constructor.call( this );
    };
    AFrame.extend( Display, AFrame.Display, {
        init: function( config ) {
            this.store = config.store;
            
            Display.sc.init.call( this, config );
        },
        
        bindEvents: function() {
            this.bindClick( '#btnNewTag', onNewTag );
        },
        
        setNote: function( note ) {
        }
    } );
    
    function onNewTag( event ) {
        event.stopImmediatePropagation();
        
        var val = $( '#newtagname' ).val();
        
        
        if( val ) {
            this.store.add( {
                name: val
            } );
        }
    }

    return Display;
}() );