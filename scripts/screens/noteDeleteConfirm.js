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
            this.bindClick( '.btnDelete', this.triggerProxy( 'onDelete' ) );
            this.bindClick( '.btnCancel', this.triggerProxy( 'onCanel' ) );
            
            Display.sc.bindEvents.call( this );
        }
    } );
    
    return Display;
}() );