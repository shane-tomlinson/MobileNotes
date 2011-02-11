
$( function() {

    var currNoteCID, newNote, deleteOnCancel, loading = true;
    
    // set the default form field factory to use our own homegrown version that 
    // creates date and time fields.
    AFrame.Form.setDefaultFieldFactory( formFieldFactory );

    var mainController = createMainController();
    
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
    tagStore.load();
	noteStore.load( { page: 0, onComplete: function() { 
        mainController.initialRouting();
    } } );

    // update the note list.
	$( '#notelist' ).listview();
	loading = false;
	
	$( '#btnAddNote' ).click( function( event ) {
		event.preventDefault();
		
		noteStore.add( {
			title: '',
			contents: ''
		}, {
			insertAt: 0,
            onComplete: function( note ) {
                newNote = true;
                location.href = location.href.replace( /#.*/, '' ) + '#noteEditForm&id=' + note.get( 'id' );
            }
		} );
	} );


    function createMainController() {
        var controller = AFrame.create( MobileNotes.MainController, {
            target: $( window )
        } );
        
        controller.bindEvent( 'editnote', function( event ) {
            var noteID = event.id;
            if( noteID != this.currentNoteID ) {
                var note = noteStore.getByID( noteID );
                if( note ) {
                    this.currentNoteID = noteID;
                    editNote( note.getCID() );
                }
            }
        } );
        
        return controller;
    }

    function createNoteDBAdapter() {
        var noteDBAdapter = AFrame.create( MobileNotes.PersistenceDBAccess, {
                schema: MobileNotes.NoteSchemaConfig,
                tableName: 'Note'
        } );
        
        return noteDBAdapter;
    }
    
    function createNoteStore() {
        var noteStore = AFrame.create( AFrame.CollectionArray, {
            plugins: [ [ AFrame.CollectionPluginPersistence, {
                        loadCallback: noteDBAdapter.load.bind( noteDBAdapter ),
                        addCallback: noteDBAdapter.add.bind( noteDBAdapter ),
                        saveCallback: noteDBAdapter.save.bind( noteDBAdapter ),
                        deleteCallback: noteDBAdapter.del.bind( noteDBAdapter ),
                    }
                ],
                [ AFrame.CollectionPluginModel, {
                        schema: MobileNotes.NoteSchemaConfig
                    }
                ]
            ]
        } );
        
        noteStore.getByID = function( id ) {
            var item = this.search( function( item, cid, collection ) {
                return item.get( 'id' ) === id;
            } );
            
            return item;
        };
        
        return noteStore;
    }

    function createNoteEditModel() {
        var model = AFrame.create( AFrame.Model, {
            schema: MobileNotes.NoteSchemaConfig,
            data: {}
        } );
        
        return model;
    }
    
    function createNoteList() {
        var noteList = AFrame.create( AFrame.List, {
                target: '#notelist',
                listElementFactory: function( data, index ) {
                    return $( '#templateNote' ).tmpl( data.data );
                },
                plugins: [
                    [   // this binds the list to the note store.  Whenever notes are added or deleted
                        // from the note store, the list is automatically updated.
                        AFrame.ListPluginBindToCollection, {
                            collection: noteStore
                        }
                    ],
                    [
                        // for every note, create a form that is bound to the fields specified in the template.
                        AFrame.ListPluginFormRow
                    ]
                ]
        } );

        // When a new note is inserted, bind some events to it to put it into edit mode.
        noteList.bindEvent( 'onInsert', function( data ) {
            var noteCID = data.data.getCID();
            
            var swipe = false;
            this.bindDOMEvent( data.rowElement, 'swipeleft', function( event ) {
                event.preventDefault();

                swipe = true;
                setNoteData( this );
                $.mobile.changePage( $( '#noteExtraInfo' ) );
            }, noteCID );
            this.bindDOMEvent( data.rowElement, 'click', function( event ) {
                if( swipe ) {
                    event.stopImmediatePropagation();
                    swipe = false;
                }
            } );

            if( !loading ) {
                $( '#notelist' ).listview( 'refresh' );
            }
        } );
        
        return noteList;
    }

    function createConfirmDisplay() {
        var deleteConfirmDisplay = AFrame.create( MobileNotes.NoteDeleteConfirm, {
            target: '#noteDeleteConfirm'
        } );
         // when the delete form says delete, delete from the store.
        deleteConfirmDisplay.bindEvent( 'onDelete', function() {
            noteStore.del( currNoteCID );
        } );
       
        return deleteConfirmDisplay;
    }
    
    function createNoteExtraInfoDisplay() {
        var noteExtraInfoDisplay = AFrame.create( AFrame.DataForm, {
            target: '#noteExtraInfo',
            dataSource: noteEditModel
        } );
        return noteExtraInfoDisplay;
    }
    
    function createNoteEditForm() {
        var noteEditForm = AFrame.create( MobileNotes.NoteEditDisplay, {
            target: '#noteEditForm',
            dataSource: noteEditModel
        } );
        // when the note edit form says to save, save to the store.
        noteEditForm.bindEvent( 'onSave', saveNote );
        
        // we are keeping track of whether the current note is a new note or not.  If it is,
        //  and the user hits cancel, delete the note from the store, it was only temporary.
        noteEditForm.bindEvent( 'onCancel', function() {
            if( deleteOnCancel ) {
                noteStore.del( currNoteCID );			
            }
        } );
        
        
       return noteEditForm;
    }

    
    function createNoteTagDisplay() {
        var tagDisplay = AFrame.create( MobileNotes.NoteTagDisplay, {
            target: '#noteTags',
            list: tagList,
            dataSource: noteEditModel
        } );
        tagDisplay.bindEvent( 'newtag', function( event ) {
            tagStore.add( {
                name: event.name
            } );
        } );
        
        return tagDisplay;
    }
        
    function createTagDBAdapter() {
        var tagDBAdapter = AFrame.create( MobileNotes.PersistenceDBAccess, { 
            schema: MobileNotes.TagSchemaConfig,
            tableName: 'Tag'
        } );
        return tagDBAdapter;
    }

    function createTagStore() {
        var tagStore = AFrame.create( AFrame.CollectionArray, {
            plugins: [
                [
                    AFrame.CollectionPluginPersistence, {
                        loadCallback: tagDBAdapter.load.bind( tagDBAdapter ),
                        addCallback: tagDBAdapter.add.bind( tagDBAdapter ),
                        saveCallback: tagDBAdapter.save.bind( tagDBAdapter ),
                        deleteCallback: tagDBAdapter.del.bind( tagDBAdapter ),
                    }
                ],
                [ AFrame.CollectionPluginModel, {
                        schema: MobileNotes.TagSchemaConfig
                    }
                ]
            ]
        } );
        
        return tagStore;
    }

    function createTagList() {
        var noteList = AFrame.create( AFrame.List, {
                target: '#taglist',
                listElementFactory: function( data, index ) {
                    var el = $.tmpl( $( '#templateTag' ).html(), data.getDataObject() );
                    return el;
                },
                plugins: [
                    [   // this binds the list to the note store.  Whenever notes are added or deleted
                        // from the note store, the list is automatically updated.
                        AFrame.ListPluginBindToCollection, {
                            collection: tagStore
                        }
                    ]
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
        
        var field = AFrame.create( constructor, {
            target: element
        } );

		return field;
	}
    
 	function editNote( noteCID ) {
        setNoteData( noteCID );
		noteEditForm.show( {
			focus: !!newNote,
			disableDelete: !!newNote
		} );
        
        deleteOnCancel = newNote;
        newNote = false;
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