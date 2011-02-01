MobileNotes.WebSQLDB = ( function() {
    var DB = function() {
        DB.sc.constructor.call( this );
    };
    AFrame.extend( DB, AFrame.AObject, {
        init: function() {
            if( window.openDatabase ) {
                this.db = window.openDatabase( 'mobilenotes', '0.01', 'MobileNotes Note Database', 10*1024*1024 );
            }            
        },
        
        getDB: function() {
            return this.db;
        }
    } );
    
    DB.getInstance = function() {
        if( !DB.__uniqueInstance ) {
            DB.__uniqueInstance = AFrame.construct( {
                type: DB
            } );
        }
        return DB.__uniqueInstance;
    }
    
    return DB;
}() );
