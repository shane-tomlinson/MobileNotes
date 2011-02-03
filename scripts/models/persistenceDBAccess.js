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
                    var item = this.schema.getAppData( result );
                    this.schema.forEach( function( schemaRow, key ) {
                        // convert any "has_many" rows from JSON.
                        if( this.schema.rowHasMany( key ) ) {
                            var rowData = item[ key ];
                            try {
                                rowData = JSON.parse( rowData );
                            } catch( e ) {
                                rowData = [];
                            }
                            item[ key ] = AFrame.array( rowData ) ? rowData : [];
                        }
                    }, this );
                    
                    returnedItems.push( item );
                }, this );
                options.onComplete( returnedItems );
            }.bind( this ) );
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
                            var rowData = serializeditem[ key ];
                            // convert any "has_many" rows to JSON.
                            if( this.schema.rowHasMany( key ) ) {
                                rowData = JSON.stringify( rowData );
                            }
                            itemDBObject[ key ] = rowData;
                        }
                    }
                    
                    persistence.flush();
                }.bind( this ) );
            
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