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
            
            /**
            * The delete confirm display
            * @config deleteConfirmDisplay
            * @type {AFrame.Display}
            */
            this.deleteConfirmDisplay = config.deleteConfirmDisplay;

            /**
            * the extra info display
            * @config extraInfoDisplay
            * @type {AFrame.DataForm}
            */
            this.extraInfoDisplay = config.extraInfoDisplay;
            
            Display.sc.init.call( this, config );
            
            this.bindEvents();
        },
        
        bindEvents: function() {
            this.bindClick( '.btnSaveNote', this.onSave );
            this.bindClick( '.btnCancelNote', this.onCancel );
            this.bindDOMEvent( this.getTarget(), 'pageshow', this.onPageShow );
            
            this.deleteConfirmDisplay.bindEvent( 'onDelete', this.onDeleteConfirm, this );
        },
        
        setDataSource: function( dataSource ) {
            this.dataSource = AFrame.DataContainer( dataSource );
            
            this.dataSource.forEach( function( val, key ) {
                this.dataContainer.set( key, val );
            }, this );
            
            this.extraInfoDisplay.setDataSource( dataSource );
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
        
        onSave: function( event ) {
            var valid = this.save();
            if( valid ) {
                this.triggerEvent( 'onSave', this.dataSource.get( 'cid' ) );
            }
        },
        
        onCancel: function( event ) {
            this.triggerEvent( 'onCancel', this.dataSource.get( 'cid' ) );
        },
        
        onDeleteConfirm: function() {
            this.triggerEvent( 'onDelete', this.dataSource.get( 'cid' ) );
        },
        

        show: function( options ) {
            options = options || {};
            var target = this.getTarget();
            
            this.focusOnShow = !!options.focus;
            
            var func = options.disableDelete ? 'hide' : 'show';
            $( '.btnDeleteNote', target )[ func ]();
        },
        
        
        onPageShow: function() {
            if( this.focusOnShow ) {
                setTimeout( function() {
                    this.getTarget().find( 'input' ).focus().select();
                }.bind( this ), 100 );
            }
        }
    } );
    
    
    return Display;
}() );