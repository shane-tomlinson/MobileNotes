/**
 * Note DB Access Layer
 * @class MobileNotes.NoteDBAccess
 * @extends AFrame.AObject
 * @constructor 
 */
MobileNotes.NoteDBAccess = function() {
	MobileNotes.NoteDBAccess.sc.constructor.apply( this, arguments );
};
AFrame.extend( MobileNotes.NoteDBAccess, AFrame.AObject, {
	loadCallback: function( options ) {
		this.localDB = MobileNotes.LocalNoteDB.getInstance();

		this.localDB.load( {}, options.onComplete );
	},
	
	addCallback: function( data, options ) {
		this.localDB.add( data, options.onComplete );
	},
	
	saveCallback: function( data, options ) {
		this.localDB.save( data, options.onComplete );
	},

	delCallback: function( data, options ) {
		this.localDB.del( data, options.onComplete );
	}

} );

MobileNotes.LocalNoteDB = function() {
	MobileNotes.LocalNoteDB.sc.constructor.apply( this, arguments );
};
MobileNotes.LocalNoteDB.getInstance = function() {
	if( !MobileNotes.LocalNoteDB.instance ) {
		MobileNotes.LocalNoteDB.instance = AFrame.construct( {
			type: MobileNotes.LocalNoteDB
		} );
	}
	
	return MobileNotes.LocalNoteDB.instance;
};
MobileNotes.LocalNoteDB.isSupported = function() {
	return !!window.openDatabase;
};
AFrame.extend( MobileNotes.LocalNoteDB, AFrame.AObject, {
	init: function( config ) {
		if( window.openDatabase ) {
			this.db = window.openDatabase( 'mobilenotes', '0.01', 'MobileNotes Note Database', 10*1024*1024 );
		}
		MobileNotes.LocalNoteDB.sc.init.apply( this, arguments );
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
							var noteCopy = MobileNotes.noteSchema.fixData( note );
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
        note.date = new Date();
        note.edit_date = new Date();

        var dateString = note.date.toISOString();

		try {
			this.db.transaction( function( tx ) {
				tx.executeSql( 'insert into tbl_notes(title,contents,date,edit_date) values (?,?,?,?)',
				[
					note.title,
					note.contents,
					dateString,
					dateString
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
			var persistenceNote = MobileNotes.noteSchema.getPersistenceObject( note );
			this.db.transaction( function( tx ) {
				tx.executeSql( 'update tbl_notes set title = ?, contents = ?, edit_date = ? where rowid = ?',
				[
					persistenceNote.title,
					persistenceNote.contents,
					(new Date()).toISOString(),
					persistenceNote.id
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