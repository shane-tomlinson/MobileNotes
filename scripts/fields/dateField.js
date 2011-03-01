/**
 * A Date Field
 * @class MobileNotes.DateField
 * @extends AFrame.Field
 * @constructor
 */
MobileNotes.DateField = ( function() {
    "use strict";
    
    var Field = AFrame.Class( AFrame.Field, {
        display: function( val ) {
            if( !val ) {
                return;
            }
            
            var format = this.getTarget().attr( 'data-format' ) || 'MMM d, yyyy';
            var dateString = val.toString( format );
            
            Field.sc.display.call( this, dateString );
        }
    } );
    
    return Field;
}() );
