/**
 * Note DB Access Layer
 * @class NoteDBAccess
 * @extends AFrame.AObject
 * @constructor 
 */
MobileNotes.NoteDBAccess = ( function() {
    "use strict";
    
    var NoteDBAccess = function() {
        NoteDBAccess.sc.constructor.call( this );
    };
    AFrame.extend( NoteDBAccess, AFrame.AObject, {
        init: function( config ) {
            this.noteAdapter = NoteAdapter.getInstance();
            
            NoteDBAccess.sc.init.call( this, config );
        },
        
        load: function( options ) {
            this.noteAdapter.load( {}, onComplete.bind( this ) );
            
            function onComplete( notes ) {
                var noteData = copyNoteData.call( this, notes );
                options.onComplete && options.onComplete( noteData );
            };
            
            function copyNoteData( notes ) {
                var noteData = [];
                notes.forEach( function( note, index ) {
                    var data = jQuery.extend( {}, note );
                    noteData.push( data );
                }, this );
                return noteData;
            }
        },
        
        add: function( note, options ) {
            note.date = note.date || new Date();
            note.edit_date = note.edit_date || new Date();

            this.noteAdapter.add( note, function( noteData ) {
                options.onComplete && options.onComplete( noteData );
            }.bind( this ) );
        },
        
        save: function( note, options ) {
            var persistenceNote = note.serializeItems();
            this.noteAdapter.save( persistenceNote, options.onComplete );
        },

        del: function( data, options ) {
            this.noteAdapter.del( data.data, options.onComplete );
        }

    } );

    
    /**
    * An adapter for the notes to a WebSQL Database.
    * @class NoteAdapter
    * @extends AFrame.AObject
    */
    function NoteAdapter() {
        NoteAdapter.sc.constructor.apply( this, arguments );
    };
    NoteAdapter.getInstance = function() {
        if( !NoteAdapter.instance ) {
            NoteAdapter.instance = AFrame.construct( {
                type: NoteAdapter
            } );
        }
        
        return NoteAdapter.instance;
    };
    AFrame.extend( NoteAdapter, AFrame.AObject, {
        init: function( config ) {
            this.db = MobileNotes.WebSQLDB.getInstance().getDB();

            NoteAdapter.sc.init.apply( this, arguments );
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
                callback( note );
            }
        }
    } );
    
    return NoteDBAccess;
}() );