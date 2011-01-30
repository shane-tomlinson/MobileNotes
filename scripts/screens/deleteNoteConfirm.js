/**
* A delete note confirm page
* @class MobileNotes.DeleteNoteConfirm
* @extends AFrame.Display
* @constructor
*/
MobileNotes.DeleteNoteConfirm = ( function() {
    "use strict";
    
    var Display = function() {
        Display.sc.constructor.call( this );
    };
    AFrame.extend( Display, AFrame.Display, {
        bindEvents: function() {
            this.bindClick( '.btnDelete', this.onDelete );
            this.bindClick( '.btnCancel', this.onCancel );
            
            Display.sc.bindEvents.call( this );
        },
        
        onDelete: function( event ) {
            this.triggerEvent( 'onDelete' );
        },
        
        onCancel: function( event ) {
            this.triggerEvent( 'onCancel' );
        }
    } );
    
    return Display;
}() );