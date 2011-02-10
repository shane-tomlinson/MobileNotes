/**
* A form to edit notes.  This takes care of validating and updating the original 
* @class MobileNotes.NoteEditDisplay
* @extends AFrame.DataForm
* @constructor
*/
MobileNotes.NoteEditDisplay = ( function() {
    "use strict"
    
    var Display = AFrame.Class( AFrame.DataForm, {
        bindEvents: function() {
            this.bindClick( '.btnSaveNote', onSave );
            this.bindClick( '.btnCancelNote', onCancel );
            this.bindDOMEvent( this.getTarget(), 'pageshow', onPageShow );
            
            Display.sc.bindEvents.call( this );
        },

        show: function( options ) {
            options = options || {};
            var target = this.getTarget();
            
            this.focusOnShow = !!options.focus;
            
            var func = options.disableDelete ? 'hide' : 'show';
            $( '.btnDeleteNote', target )[ func ]();
        }
    } );
        
    function onSave( event ) {
        var valid = this.save();
        if( valid ) {
            this.triggerEvent( 'onSave' );
        }
    }

    function onCancel( event ) {
        this.triggerEvent( 'onCancel' );
    }
        
    
    function onPageShow() {
        if( this.focusOnShow ) {
            setTimeout( function() {
                this.getTarget().find( 'input' ).focus().select();
            }.bind( this ), 100 );
        }
    }
        
    function getCID() {
        return this.dataSource && this.dataSource.getCID();
    }
    
    
    return Display;
}() );