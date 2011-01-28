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
        init: function( config ) {
            Field.sc.init.call( this, config );
            
            this.format = this.getTarget().attr( 'data-time-format' ) || '12';
        },
        
        display: function( val ) {
            if( !val ) {
                return;
            }
            
            var hours = val.getHours();
            var ampm = '';
            if( this.format === '12' ) {
                if( !hours ) {
                    hours = 12;
                    ampm = 'am';
                } else if( hours > 12 ) {
                    hours -= 12;
                    ampm = 'pm';
                }
            }
            
            var timeString = hours + ':' + val.getMinutes() + ampm;
            
            Field.sc.display.call( this, timeString );
        }
    } );
    
    return Field;
}() );
