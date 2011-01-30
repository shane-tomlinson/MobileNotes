describe( "TimeField spec", function() {

    var timeField;
    
    
    it( 'is creatable', function() {
        timeField = AFrame.construct( {
            type: MobileNotes.TimeField,
            config: {
                target: '#timeField'
            }
        } );
        
        expect( timeField instanceof MobileNotes.TimeField ).toBe( true );
    } );
    
    it( 'should display a time using the 12 hour format', function() {
        timeField.display( Date.parse( 'February 1, 2011' ) );
        
        expect( $( '#timeField' ).val() ).toBe( '12:00am' );
    } );

    it( 'should display a time using the 24 hour format', function() {
        $( '#timeField' ).attr( 'data-time-format', 24 );
        
        timeField.display( Date.parse( 'February 1, 2011' ) );
        
        expect( $( '#timeField' ).val() ).toBe( '0:00' );
    } );
    
} );