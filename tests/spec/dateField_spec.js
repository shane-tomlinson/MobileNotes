describe( "DateField spec", function() {

    var dateField;
    
    
    it( 'is creatable', function() {
        dateField = AFrame.construct( {
            type: MobileNotes.DateField,
            config: {
                target: '#dateField'
            }
        } );
        
        expect( dateField instanceof MobileNotes.DateField ).toBe( true );
    } );
    
    it( 'should display a date', function() {
        dateField.display( Date.parse( 'February 1, 2011' ) );
        
        expect( $( '#dateField' ).val() ).toBe( 'Feb 1, 2011' );
    } );
    
} );