describe( "DeleteNoteConfirm spec", function() {

    var timeField;
    var events = {};
    var genericHandler = function( event ) {
        events[ event.type ] = event;
    }
    
    it( 'is creatable', function() {
        timeField = AFrame.construct( {
            type: MobileNotes.DeleteNoteConfirm,
            config: {
                target: '#deleteNoteConfirm'
            }
        } );
        
        expect( timeField instanceof MobileNotes.DeleteNoteConfirm ).toBe( true );
    } );
    
    it( 'should trigger onCancel when cancel hit', function() {
        timeField.bindEvent( 'onCancel', genericHandler );
        
        $( '.btnCancel' ).trigger( 'click' );
        
        expect( events.onCancel ).toBeDefined();
    } );

    it( 'should trigger onDelete when delete hit', function() {
        timeField.bindEvent( 'onDelete', genericHandler );
        
        $( '.btnDelete' ).trigger( 'click' );
        
        expect( events.onCancel ).toBeDefined();
    } );
} );