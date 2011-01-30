/**
 * A Time Field
 * @class MobileNotes.TimeField
 * @extends AFrame.Field
 * @constructor
 */
MobileNotes.TimeField = ( function() {
    "use strict";
    
    var Field = function() {
        Field.sc.constructor.call( this );
    };
    AFrame.extend( Field, AFrame.Field, {
        display: function( val ) {
            if( !val ) {
                return;
            }
            
            var hours = val.getHours();
            var ampm = '';
            if( getFormat.call( this ) === '12' ) {
                if( !hours ) {
                    hours = 12;
                    ampm = 'am';
                } else if( hours > 12 ) {
                    hours -= 12;
                    ampm = 'pm';
                }
            }
            
            var mins = val.getMinutes();
            mins = mins < 10 ? '0' + mins : mins;
            
            var timeString = hours + ':' + mins + ampm;
            
            Field.sc.display.call( this, timeString );
        }
    } );
    
    function getFormat() {
        return this.getTarget().attr( 'data-time-format' ) || '12';
    }
    
    return Field;
}() );
