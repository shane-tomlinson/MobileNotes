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
        init: function( config ) {
            Display.sc.init.call( this, config );
            
            this.bindEvents();
        },
        
        bindEvents: function() {
            this.bindDOMEvent( '.btnDelete', 'click', this.onDelete, this );
            this.bindDOMEvent( '.btnCancel', 'click', this.onCancel, this );
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