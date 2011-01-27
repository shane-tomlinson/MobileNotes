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
            this.bindDOMEvent( '.btnSaveNote', 'click', this.onSave, this );
            this.bindDOMEvent( '.btnCancelNote', 'click', this.onCancel, this );
            this.bindDOMEvent( '.btnDeleteNote', 'click', this.onDelete, this );
            this.bindDOMEvent( this.getTarget(), 'pageshow', this.onPageShow, this );
            
            this.deleteConfirmDisplay.bindEvent( 'onDelete', this.onDeleteConfirm, this );
            this.deleteConfirmDisplay.bindEvent( 'onCancel', this.onDeleteCancel, this );
        },
        
        setDataSource: function( dataSource ) {
            this.dataSource = AFrame.DataContainer( dataSource );
            
            this.dataSource.forEach( function( val, key ) {
                this.dataContainer.set( key, val );
            }, this );
            
            this.extraInfoDisplay.setDataSource( dataSource );
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
        
        onDelete: function( event ) {
            this.deleteConfirmDisplay.show();
        },
        
        onDeleteConfirm: function() {
            this.triggerEvent( 'onDelete', this.dataSource.get( 'cid' ) );
            this.deleteConfirmDisplay.hide();
        },
        
        onDeleteCancel: function() {
            this.deleteConfirmDisplay.hide();
        },

        show: function( options ) {
            options = options || {};
            var target = this.getTarget();
            
            this.focusOnShow = !!options.focus;
            
            if( options.disableDelete ) {
                $( '.btnDeleteNote', target ).hide();
            }
            else {
                $( '.btnDeleteNote', target ).show();
            }
        },
        
        onPageShow: function() {
            if( this.focusOnShow ) {
                setTimeout( function() {
                    this.getTarget().find( 'input' ).focus().select();
                }.bind( this ), 250 );
            }
        }
    } );
    return Display;
}() );