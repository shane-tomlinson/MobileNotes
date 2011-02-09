/**
* A WebSQL database driver
* @class MobileNotes.WebSQLDB
* @extends AFrame.AObject
* @constructor
*/
MobileNotes.WebSQLDB = ( function() {
    "use strict";
    
    var DB = function() {
        DB.sc.constructor.call( this );
    };
    AFrame.extend( DB, AFrame.AObject, {
        init: function() {
            if( persistence.store ) {
                try {
                    persistence.store.websql.config( persistence, 'mobilenotes2', 'MobileNotes Note Database', 10*1024*1024 );
                }
                catch( e ) {
                    this.inMemory = true;
                    
                    // fallback to in memory
                    persistence.store.memory.config( persistence, 'mobilenotes2' );
                }
            }            
        },
        
        load: function() {
            if( this.inMemory && !this.loaded ) {
                this.loaded = true;
                try {
                    persistence.loadFromLocalStorage();
                    $( window ).bind( 'beforeunload', this.save.bind( this ) );
                } catch ( e ) {
                    // old IE will die here
                }
            }
        },
        
        save: function() {
            if( this.inMemory ) {
                persistence.saveToLocalStorage();
            }
        }
    } );
    
    /**
    * Get the unique instance of the WebSQLDB driver.
    * @method DB.getInstance()
    */
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
