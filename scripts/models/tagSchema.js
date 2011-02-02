MobileNotes.TagSchemaConfig = {
	id: { type: 'text' },
	name: { type: 'text', validate: {
        required: true,
        minlength: 1,
        maxlength: 50
	} },
	date: { type: 'iso8601' },
	edit_date: { type: 'iso8601' }
};
