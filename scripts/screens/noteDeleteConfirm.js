/**
* A delete note confirm page
* @class MobileNotes.NoteDeleteConfirm
* @extends AFrame.Display
* @constructor
*/
MobileNotes.NoteDeleteConfirm = ( function() {
    "use strict";
    
    var Display = AFrame.Class( AFrame.Display, {
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