describe( "NoteDeleteConfirm spec", function() {

    var screen;
    var events = {};
    var genericHandler = function( event ) {
        events[ event.type ] = event;
    }
    
    it( 'is creatable', function() {
        screen = AFrame.construct( {
            type: MobileNotes.NoteDeleteConfirm,
            config: {
                target: '#deleteNoteConfirm'
            }
        } );
        
        expect( screen instanceof MobileNotes.NoteDeleteConfirm ).toBe( true );
    } );
    
    it( 'should trigger onCancel when cancel hit', function() {
        screen.bindEvent( 'onCancel', genericHandler );
        
        $( '.btnCancel' ).trigger( 'click' );
        
        expect( events.onCancel ).toBeDefined();
    } );

    it( 'should trigger onDelete when delete hit', function() {
        screen.bindEvent( 'onDelete', genericHandler );
        
        $( '.btnDelete' ).trigger( 'click' );
        
        expect( events.onCancel ).toBeDefined();
    } );
} );