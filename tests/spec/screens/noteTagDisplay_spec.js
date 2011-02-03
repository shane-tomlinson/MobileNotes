describe( "NoteTagDisplay spec", function() {

    var screen;
    var events = {};
    var genericHandler = function( event ) {
        events[ event.type ] = event;
    }
    
    var dataContainer = AFrame.DataContainer( {
        tag_ids: []
    } );
    var list;
    
    it( 'is creatable', function() {
        list = AFrame.construct( {
            type: AFrame.List,
            config: {
                target: '#noteList'
            }
        } );
        
        screen = AFrame.construct( {
            type: MobileNotes.NoteTagDisplay,
            config: {
                target: '#noteTagDisplay',
                dataSource: dataContainer,
                list: list
            }
        } );
        
        expect( screen instanceof MobileNotes.NoteTagDisplay ).toBe( true );
    } );

    it( 'triggers newtag when #newtagname has a value and #btnNewTag is clicked', function() {
        $( '#newtagname' ).val( '' );
        
        screen.bindEvent( 'newtag', genericHandler );
        
        $( '#btnNewTag' ).trigger( 'click' );
        expect( events.newtag ).toBeUndefined();
        
        $( '#newtagname' ).val( 'new tag' );
        $( '#btnNewTag' ).trigger( 'click' );
        expect( events.newtag ).toBeDefined();
        expect( events.newtag.name ).toBe( 'new tag' );
    } );
    
    

} );