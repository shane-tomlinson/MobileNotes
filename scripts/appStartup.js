
$( function() {

    var currNoteCID, newNote, editAddedNote, loading = true;
    
    // set the default form field factory to use our own homegrown version that 
    // creates date and time fields.
    AFrame.Form.setDefaultFieldFactory( formFieldFactory );

    // We are first creating a DB Adapter - This uses persistence.js
	var noteDBAdapter = createNoteDBAdapter();
    
    // We are then creating a note store that is tied to the persistence layer.
    var noteStore = createNoteStore();
	
    
    // create the note list that is bound to the noteStore.  For every note, create a form row,
    // overriding the default form factory to use our own formFieldFactory.
	var noteList = createNoteList();


    // noteEditModel holds the data for the note currently being edited.  It is shared across
    //  the noteEditDisplay
    var noteEditModel = createNoteEditModel();
    
    // Create an adapter, store, and list for the tags.
    var tagDBAdapter = createTagDBAdapter();
    var tagStore = createTagStore();
    var tagList = createTagList();
	var tagDisplay = createNoteTagDisplay();
    
	// The note delete confirmation
	var deleteConfirmDisplay = createConfirmDisplay();
	
    // Extra info about the note.
	var noteExtraInfoDisplay = createNoteExtraInfoDisplay();
	
    // this is the form that actually edits the notes.  It takes a reference
    //  to both the extra info and delete confirmation displays.
	var noteEditForm = createNoteEditForm();
	
    // finally, load the stores.
	noteStore.load( { page: 0 } );
    tagStore.load();

    // update the note list.
	$( '#notelist' ).listview();
	loading = false;
	
	$( '#btnAddNote' ).click( function( event ) {
		event.preventDefault();
		
		editAddedNote = true;
		
		noteStore.add( {
			title: '',
			contents: ''
		}, {
			insertAt: 0
		} );
	} );


    function createNoteDBAdapter() {
        var noteDBAdapter = AFrame.construct( { 
            type: MobileNotes.PersistenceDBAccess,
            config: {
                schema: MobileNotes.NoteSchemaConfig,
                tableName: 'Note'
            }
            
        } );
        
        return noteDBAdapter;
    }
    
    function createNoteStore() {
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
                },
                {
                    type: AFrame.CollectionPluginModel,
                    config: {
                        schema: MobileNotes.NoteSchemaConfig
                    }
                }
            ]
        } );
        
        return noteStore;
    }

    function createNoteEditModel() {
        var model = AFrame.construct( {
            type: AFrame.Model,
            config: {
                schema: MobileNotes.NoteSchemaConfig,
                data: {}
            }
        } );
        
        return model;
    }
    
    function createNoteList() {
        var noteList = AFrame.construct( {
            type: AFrame.List,
            config: {
                target: '#notelist',
                listElementFactory: function( data, index ) {
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

        // When a new note is inserted, bind some events to it to put it into edit mode.
        noteList.bindEvent( 'onInsert', function( data ) {
            var noteCID = data.data.getCID();
            var handleClick = true;
            $( 'a', data.rowElement ).bind( 'click', function( event ) {
                if( handleClick ) {
                    newNote = false;
                    editNote( '' + this );
                }
                else {
                    event.preventDefault();
                    event.stopPropagation();
                }
                handleClick=true;
            }.bind( noteCID ) );
            
            $( data.rowElement ).bind( 'swipeleft', function( event ) {
                handleClick = false;
                setNoteData( this );
                $.mobile.changePage( $( '#noteExtraInfo' ) )
                event.preventDefault();
            }.bind( noteCID ) );
            
            if( editAddedNote ) {
                newNote = true;
                editNote( noteCID, true );
                editAddedNote = false;
            }
            
            if( !loading ) {
                $( '#notelist' ).listview( 'refresh' );
            }
        } );
        
        return noteList;
    }

    function createConfirmDisplay() {
        var deleteConfirmDisplay = AFrame.construct( {
            type: MobileNotes.NoteDeleteConfirm,
            config: {
                target: '#noteDeleteConfirm'
            }
        } );
         // when the delete form says delete, delete from the store.
        deleteConfirmDisplay.bindEvent( 'onDelete', function() {
            noteStore.del( currNoteCID );
        } );
       
        return deleteConfirmDisplay;
    }
    
    function createNoteExtraInfoDisplay() {
        var noteExtraInfoDisplay = AFrame.construct( {
            type: AFrame.DataForm,
            config: {
                target: '#noteExtraInfo',
                dataSource: noteEditModel
            }
        } );
        return noteExtraInfoDisplay;
    }
    
    function createNoteEditForm() {
        var noteEditForm = AFrame.construct( {
            type: MobileNotes.NoteEditDisplay,
            config: {
                target: '#noteEditForm',
                dataSource: noteEditModel
            }
        } );
        // when the note edit form says to save, save to the store.
        noteEditForm.bindEvent( 'onSave', saveNote );
        
        // we are keeping track of whether the current note is a new note or not.  If it is,
        //  and the user hits cancel, delete the note from the store, it was only temporary.
        noteEditForm.bindEvent( 'onCancel', function() {
            if( newNote ) {
                noteStore.del( currNoteCID );			
            }
        } );
        
        
       return noteEditForm;
    }

    
    function createNoteTagDisplay() {
        var tagDisplay = AFrame.construct( {
            type: MobileNotes.NoteTagDisplay,
            config: {
                target: '#noteTags',
                list: tagList,
                dataSource: noteEditModel
            }
        } );
        tagDisplay.bindEvent( 'newtag', function( event ) {
            tagStore.add( {
                name: event.name
            } );
        } );
        
        return tagDisplay;
    }
        
    function createTagDBAdapter() {
        var tagDBAdapter = AFrame.construct( { 
            type: MobileNotes.PersistenceDBAccess,
            config: {
                schema: MobileNotes.TagSchemaConfig,
                tableName: 'Tag'
            }
            
        } );
        return tagDBAdapter;
    }

    function createTagStore() {
        var tagStore = AFrame.construct( {
            type: AFrame.CollectionArray,
            plugins: [
                {
                    type: AFrame.CollectionPluginPersistence,
                    config: {
                        loadCallback: tagDBAdapter.load.bind( tagDBAdapter ),
                        addCallback: tagDBAdapter.add.bind( tagDBAdapter ),
                        saveCallback: tagDBAdapter.save.bind( tagDBAdapter ),
                        deleteCallback: tagDBAdapter.del.bind( tagDBAdapter ),
                    }
                },
                {
                    type: AFrame.CollectionPluginModel,
                    config: {
                        schema: MobileNotes.TagSchemaConfig
                    }
                }
            ]
        } );
        
        return tagStore;
    }

    function createTagList() {
        var noteList = AFrame.construct( {
            type: AFrame.List,
            config: {
                target: '#taglist',
                listElementFactory: function( data, index ) {
                    var el = $.tmpl( $( '#templateTag' ).html(), data.getDataObject() );
                    return el;
                }
            },
            plugins: [
                {   // this binds the list to the note store.  Whenever notes are added or deleted
                    // from the note store, the list is automatically updated.
                    type: AFrame.ListPluginBindToCollection,
                    config: {
                        collection: tagStore
                    }
                }/*,
                {
                    // for every note, create a form that is bound to the fields specified in the template.
                    type: AFrame.ListPluginFormRow
                }
                */
            ]
        } );
        
        return noteList;
    }
    

    // Set up a form field factory.  Note, we are using a specialized form field factory because
    //  we have some custom fields.  AFrame.Field is the default field type created if there is
    //  no formFieldFactory
	function formFieldFactory( element, meta ) {
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
	}
    
 	function editNote( noteCID, newNote ) {
        setNoteData( noteCID );
		noteEditForm.show( {
			focus: !!newNote,
			disableDelete: !!newNote
		} );
	}
    
    function setNoteData( noteCID ) {
        var dataContainer = noteStore.get( noteCID );
        currNoteCID = noteCID;
        
        dataContainer.forEach( function( val, key ) {
            // we have to do this so that we aren't passing the original array reference.  Otherwise
            //  we pass the original array reference and update that.  Bad jiji.
            if( AFrame.array( val ) ) {
                val = $.extend( [], val );
            }
            else if( AFrame.string( val ) ) {
                val = '' + val;
            }
          /*  else if( 'object' == typeof( val ) ) {
                val = $.extend( {}, val );
            }
            */
            noteEditModel.set( key, val, true );
        } );
    }
    
    function saveNote() {
        var dataContainer = noteStore.get( currNoteCID );
        dataContainer.forEach( function( val, key ) {
            dataContainer.set( key, noteEditModel.get( key ) );
        } );

        noteStore.save( currNoteCID );
    }
   
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