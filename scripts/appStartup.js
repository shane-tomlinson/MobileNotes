
$( function() {

    // We are first creating a DB Adapter - the DB Adapter will save notes to a local WebSQL database
    //  if the browser supports it.
    var noteDBAdapter = AFrame.construct( { 
    	type: MobileNotes.NoteDBAccess,
        config: {
            schema: MobileNotes.NoteSchemaConfig
        }
    } );
	
    // We are then creating a note store that is tied to the persistence layer.
	var noteStore = AFrame.construct( {
		type: AFrame.CollectionArray,
		plugins: [
			{
				type: AFrame.CollectionPluginPersistence,
				config: {
					loadCallback: noteDBAdapter.load.bind( noteDBAdapter ),
					addCallback: noteDBAdapter.add.bind( noteDBAdapter ),
					saveCallback: noteDBAdapter.save.bind( noteDBAdapter ),
					deleteCallback: noteDBAdapter.del.bind( noteDBAdapter ),
					
				}
			}
		]
	} );
	
    // Set up a form field factory.  Note, we are using a specialized form field factory because
    //  we have some custom fields.  AFrame.Field is the default field type created if there is
    //  no formFieldFactory
	var formFieldFactory = function( element, meta ) {
        var type = $( element ).attr( 'type' );
        var constructors = {
            date: MobileNotes.DateField,
            time: MobileNotes.TimeField,
            'default': AFrame.Field
        };
        
        var constructor = constructors[ type ] || constructors[ 'default' ];
        
        var field = AFrame.construct( {
            type: constructor,
            config: {
                target: element
            }
        } );

		return field;
	};
	
    // set the default form field factory to use our own homegrown version that 
    // creates date and time fields.
    AFrame.Form.setDefaultFieldFactory( formFieldFactory );
    
    // create the note list that is bound to the noteStore.  For every note, create a form row,
    // overriding the default form factory to use our own formFieldFactory.
	var noteList = AFrame.construct( {
		type: AFrame.List,
		config: {
			target: '#notelist',
			listElementFactory: function( index, data ) {
				return $( $( '#templateNote' ).html() );
			}
		},
		plugins: [
			{   // this binds the list to the note store.  Whenever notes are added or deleted
                // from the note store, the list is automatically updated.
				type: AFrame.ListPluginBindToCollection,
				config: {
					collection: noteStore
				}
			},
			{
                // for every note, create a form that is bound to the fields specified in the template.
				type: AFrame.ListPluginFormRow
			}
		]
	} );

	
	// The note delete confirmation
	var deleteConfirmDisplay = AFrame.construct( {
		type: MobileNotes.DeleteNoteConfirm,
		config: {
			target: '#deleteNoteConfirm'
		}
	} );
	
    // Extra info about the note.
	var noteExtraInfoDisplay = AFrame.construct( {
		type: MobileNotes.NoteExtraInfoDisplay,
		config: {
			target: '#noteExtraInfo',
			formFieldFactory: formFieldFactory
		}
	} );
	
    // this is the form that actually edits the notes.  It takes a reference
    //  to both the extra info and delete confirmation displays.
	var editNoteForm = AFrame.construct( {
		type: MobileNotes.EditNoteDisplay,
		config: {
			target: '#editNoteForm',
			formFieldFactory: formFieldFactory,
			deleteConfirmDisplay: deleteConfirmDisplay,
			extraInfoDisplay: noteExtraInfoDisplay
		}
	} );
	
    // when the note edit form says a delete happens, delete from the store.
	editNoteForm.bindEvent( 'onDelete', function( event, cid ) {
        noteStore.del( cid );
	} );
	
    // when the note edit form says to save, save to the store.
	editNoteForm.bindEvent( 'onSave', function( event, cid ) {
        noteStore.save( cid );
	} );
	
    // we are keeping track of whether the current note is a new note or not.  If it is,
    //  and the user hits cancel, delete the note from the store, it was only temporary.
	var newNote;
	editNoteForm.bindEvent( 'onCancel', function( event, cid ) {
		if( newNote ) {
			noteStore.del( cid );			
		}
	} );
	
	var editNote = function( dataContainer, newNote ) {
		editNoteForm.setDataSource( dataContainer );
		editNoteForm.show( {
			focus: !!newNote,
			disableDelete: !!newNote
		} );
	};
	
	var loading = true;
    // When a new note is inserted, bind some events to it to put it into edit mode.
	noteList.bindEvent( 'onInsert', function( data ) {
		$( 'a', data.rowElement ).click( function( event ) {
			newNote = false;
			editNote( this );
		}.bind( data.data ) );
		
		if( MobileNotes.editAddedNote ) {
			newNote = true;
			editNote( data.data, true );
			MobileNotes.editAddedNote = false;
		}
		
		if( !loading ) {
			$( '#notelist' ).listview( 'refresh' );
		}
	} );
	
    // finally, load the note store.
	noteStore.load( { page: 0 } );
    
    // update the note list.
	$( '#notelist' ).listview();
	loading = false;
	
	$( '#btnAddNote' ).click( function( event ) {
		event.preventDefault();
		
		MobileNotes.editAddedNote = true;
		
		noteStore.add( {
			title: '',
			contents: ''
		}, {
			insertAt: 0
		} );
	} );
	
} );

function parseISO8601(str) {
	// we assume str is a UTC date ending in 'Z'
	try{
		var parts = str.split('T'),
		dateParts = parts[0].split('-'),
		timeParts = parts[1].split('Z'),
		timeSubParts = timeParts[0].split(':'),
		timeSecParts = timeSubParts[2].split('.'),
		timeHours = Number(timeSubParts[0]),
		_date = new Date;
		
		_date.setUTCFullYear(Number(dateParts[0]));
		_date.setUTCMonth(Number(dateParts[1])-1);
		_date.setUTCDate(Number(dateParts[2]));
		_date.setUTCHours(Number(timeHours));
		_date.setUTCMinutes(Number(timeSubParts[1]));
		_date.setUTCSeconds(Number(timeSecParts[0]));
		if (timeSecParts[1]) _date.setUTCMilliseconds(Number(timeSecParts[1]));
		
		// by using setUTC methods the date has already been converted to local time(?)
		return _date;
	}
	catch(e) {
		
	}
}