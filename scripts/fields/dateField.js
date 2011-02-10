/**
 * A Date Field
 * @class MobileNotes.DateField
 * @extends AFrame.Field
 * @constructor
 */
MobileNotes.DateField = ( function() {
    "use strict";
    
    var monthNamesShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    var Field = AFrame.Class( AFrame.Field, {
        display: function( val ) {
            if( !val ) {
                return;
            }
            
            var monthName = monthNamesShort[ val.getMonth() ];
            var date = val.getDate();
            var year = val.getFullYear();

            var dateString = monthName + ' ' + date + ', ' + year;
            
            Field.sc.display.call( this, dateString );
        }
    } );
    
    return Field;
}() );
