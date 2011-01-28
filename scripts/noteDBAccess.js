/**
 * Note DB Access Layer
 * @class NoteDBAccess
 * @extends AFrame.AObject
 * @constructor 
 */
MobileNotes.NoteDBAccess = ( function() {
    "use strict";
    
    function noteModelFactory( data ) {
        var noteModel = AFrame.construct( {
            type: AFrame.Model,
            config: {
                schema: this.schema,
                data: data
            }
        } );
        
        return noteModel;
    };
    
    var NoteDBAccess = function() {
        NoteDBAccess.sc.constructor.call( this );
    };
    AFrame.extend( NoteDBAccess, AFrame.AObject, {
        init: function( config ) {
            this.schema = config.schema;
            this.localDB = WebSQLDB.getInstance();
            
            NoteDBAccess.sc.init.call( this, config );
        },
        
        load: function( options ) {
            this.localDB.load( {}, function( notes ) {
                var noteModels = [];
                notes.forEach( function( note, index ) {
                    var model = noteModelFactory.call( this, note );
                    noteModels.push( model );
                }.bind( this ) );
                options.onComplete && options.onComplete( noteModels );
            } );
        },
        
        add: function( note, options ) {
            note.date = note.date || new Date();
            note.edit_date = note.edit_date || new Date();

            this.localDB.add( note, function( noteData ) {
                var noteModel = noteModelFactory.call( this, noteData );
                options.onComplete && options.onComplete( noteModel );
            }.bind( this ) );
        },
        
        save: function( note, options ) {
            var persistenceNote = note.serializeItems();
            this.localDB.save( persistenceNote, options.onComplete );
        },

        del: function( data, options ) {
            this.localDB.del( data, options.onComplete );
        }

    } );

    
    /**
    * A WebSQL Database interface
    * @class WebSQLDB
    * @extends AFrame.AObject
    */
    function WebSQLDB() {
        WebSQLDB.sc.constructor.apply( this, arguments );
    };
    WebSQLDB.getInstance = function() {
        if( !WebSQLDB.instance ) {
            WebSQLDB.instance = AFrame.construct( {
                type: WebSQLDB
            } );
        }
        
        return WebSQLDB.instance;
    };
    WebSQLDB.isSupported = function() {
        return !!window.openDatabase;
    };
    AFrame.extend( WebSQLDB, AFrame.AObject, {
        init: function( config ) {
            if( window.openDatabase ) {
                this.db = window.openDatabase( 'mobilenotes', '0.01', 'MobileNotes Note Database', 10*1024*1024 );
            }
            WebSQLDB.sc.init.apply( this, arguments );
        },
        
        load: function( options, callback ) {
            try {
                this.db.transaction( function( tx ) {

                    tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_notes( id integer PRIMARY KEY, title TEXT, contents TEXT, date TEXT, edit_date TEXT)',
                        []);
                        
                    tx.executeSql( 'SELECT id, title, contents, date, edit_date FROM tbl_notes order by id DESC',
                        [],
                        function( tx, results ) {
                            var notes = [];
                            var len = results.rows.length;
                            for( var index = 0, note; index < len; ++index ) {
                                note = results.rows.item( index );
                                var noteCopy = jQuery.extend( {}, note );
                                notes.push( noteCopy );
                            }
                            callback( notes );
                        },
                        function( tx, error ) {
                            console.log( error );
                        } 
                    );
                }.bind( this ) );
            } catch ( e ) {
                console.log( 'error in addNote: ' + e.toString() );
            }
        },
        
        add: function( note, callback ) {
            try {
                this.db.transaction( function( tx ) {
                    tx.executeSql( 'insert into tbl_notes(title,contents,date,edit_date) values (?,?,?,?)',
                    [
                        note.title,
                        note.contents,
                        note.date.toISOString(),
                        note.edit_date.toISOString()
                    ],
                    function( tx, results ) {
                        note.id = results.insertId;
                        callback( note );
                    },
                    function( tx, error ) {
                        console.log( error );
                    } );
                }.bind( this ) );
            } catch ( e ) {
                console.log( 'error in add: ' + e.toString() );
                
                note.id = AFrame.getUniqueID();
                callback( note );
            }
        },
        
        save: function( note, callback ) {
            try {
                this.db.transaction( function( tx ) {
                    tx.executeSql( 'update tbl_notes set title = ?, contents = ?, edit_date = ? where rowid = ?',
                    [
                        note.title,
                        note.contents,
                        (new Date()).toISOString(),
                        note.id
                    ],
                    function( tx, results ) {
                        callback && callback( note );
                    },
                    function( tx, error ) {
                        console.log( error );
                    } );
                }.bind( this ) );
            } catch ( e ) {
                console.log( 'error in save: ' + e.toString() );
                callback( note );
            }
        },
        
        del: function( note, callback ) {
            try {
            
                this.db.transaction( function( tx ) {
                    tx.executeSql( 'delete from tbl_notes where rowid = ?',
                    [
                        note.id
                    ],
                    function( tx, results ) {
                        callback( note );
                    },
                    function( tx, error ) {
                        console.log( error );
                    } );
                }.bind( this ) );
            } catch ( e ) {
                console.log( 'error in del: ' + e.toString() );
            }
        }
    } );
    
    return NoteDBAccess;
}() );