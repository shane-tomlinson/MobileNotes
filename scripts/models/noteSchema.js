MobileNotes.NoteSchemaConfig = {
	id: { type: 'text' },
	title: { type: 'text', validate: {
        required: true,
        minlength: 1,
        maxlength: 50
	} },
	contents: { type: 'text', validate: {
        required: true
	} },
	date: { type: 'iso8601' },
	edit_date: { type: 'iso8601' },
    tag_ids: { type: 'string', has_many: true }
};
