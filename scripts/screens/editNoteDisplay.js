/**
* A form to edit notes
* @class MobileNotes.EditNoteDisplay
* @extends AFrame.DataForm
* @constructor
*/
MobileNotes.EditNoteDisplay = ( function() {
    "use strict"
    
    var Display = function() {
        Display.sc.constructor.call( this );
    };
    AFrame.extend( Display, AFrame.DataForm, {
        init: function( config ) {
            config.dataSource = AFrame.DataContainer( {} );
            
            Display.sc.init.call( this, config );
        },
        
        bindEvents: function() {
            this.bindClick( '.btnSaveNote', onSave );
            this.bindClick( '.btnCancelNote', onCancel );
            this.bindDOMEvent( this.getTarget(), 'pageshow', onPageShow );
            
            Display.sc.bindEvents.call( this );
        },
        
        setDataSource: function( dataSource ) {
            this.dataSource = AFrame.DataContainer( dataSource );
            
            this.dataSource.forEach( function( val, key ) {
                this.dataContainer.set( key, val );
            }, this );
        },
        
        checkValidity: function() {
            // check the validity vs the original model.  See if things are kosher before
            //  we save.
		    var valid = Display.sc.checkValidity.call( this )
                && this.validateFormFieldsWithModel( this.dataSource );
		
		    return valid;
        },
        
        save: function() {
            var valid = Display.sc.save.apply( this, arguments );
            
            if( valid ) {
                // Update the original data source with the updated data from the dataContainer.
                this.dataSource.forEach( function( val, key ) {
                    // we do it this way so that we don't pollute the original dataSource with extra data
                    var updatedValue = this.dataContainer.get( key );
                    this.dataSource.set( key, updatedValue );
                }, this );
            }
            
            return valid;
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