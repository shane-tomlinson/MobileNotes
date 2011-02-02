/**
 * item DB Access Layer
 * @class PersistenceDBAccess
 * @extends AFrame.AObject
 * @constructor 
 */
MobileNotes.PersistenceDBAccess = ( function() {
    "use strict";
    
    var PersistenceDBAccess = function() {
        PersistenceDBAccess.sc.constructor.call( this );
    };
    AFrame.extend( PersistenceDBAccess, AFrame.AObject, {
        init: function( config ) {
            this.schema = AFrame.Schema( config.schema );
            this.tableName = config.tableName;
            
            MobileNotes.WebSQLDB.getInstance();
            var DBTaskConfig = {};
            
            this.schema.forEach( function( row, key ) {
                if( key !== 'id' ) {
                    DBTaskConfig[ key ] = 'TEXT';
                }
            } );
            
            this.DBTask = persistence.define( this.tableName, DBTaskConfig );
            persistence.schemaSync();
            
            PersistenceDBAccess.sc.init.call( this, config );
        },
        
        load: function( options ) {
            var allitems = this.DBTask.all();
            var returnedItems = [];
            
            allitems.list( null, function( results ) {
                results.forEach( function( result ) {
                    var item = jQuery.extend( {}, result );
                    returnedItems.push( item );
                } );
                options.onComplete( returnedItems );
            } );
        },
        
        add: function( item, options ) {
            item.set( 'date', item.get( 'date' ) || new Date() );
            item.set( 'edit_date', item.get( 'edit_date' ) || new Date() );

            var serializeditem = item.serializeItems();
            AFrame.remove( serializeditem, 'id' );
            
            var itemDBObject = new this.DBTask( serializeditem );
            persistence.add( itemDBObject );
            persistence.flush();
                
            item.set( 'id', itemDBObject.id );
            options.onComplete( item );
        },
        
        save: function( item, options ) {
            item.set( 'edit_date', new Date() );
            var serializeditem = item.serializeItems();
            
            this.DBTask.all().filter( 'id', '=', item.get( 'id' ) ).one( null, 
                function( itemDBObject ) {
                    for( var key in serializeditem ) {
                        if( key !== 'id' ) {
                            itemDBObject[ key ] = serializeditem[ key ];
                        }
                    }
                    
                    persistence.flush();
                } );
            
        },

        del: function( item, options ) {
            this.DBTask.all().filter( 'id', '=', item.get( 'id' ) ).one( null, 
                function( itemDBObject ) {
                    persistence.remove( itemDBObject );
                    persistence.flush();
                    options.onComplete();
                } );
        }

    } );

    return PersistenceDBAccess;
}() );