describe( "NoteEditDisplay spec", function() {

    var screen;
    var events = {};
    var genericHandler = function( event ) {
        events[ event.type ] = event;
    }
    
    it( 'is creatable', function() {
        screen = AFrame.construct( {
            type: MobileNotes.NoteEditDisplay,
            config: {
                target: '#editNote',
                dataSource: AFrame.DataContainer( {} )
            }
        } );
        
        expect( screen instanceof MobileNotes.NoteEditDisplay ).toBe( true );
    } );
    
    it( 'raises onSave when the btnSaveNote clicked', function() {
        screen.bindEvent( 'onSave', genericHandler );
        
        $( '.btnSaveNote' ).trigger( 'click' );
        
        expect( events.onSave ).toBeDefined();
    } );
    
    it( 'raises onCancel when the btnCancelNote clicked', function() {
        screen.bindEvent( 'onCancel', genericHandler );
        
        $( '.btnCancelNote' ).trigger( 'click' );
        
        expect( events.onCancel ).toBeDefined();
    } );
    
} );