const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('noteful_notes');
    },

    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    getById(knex, note_id) {
        return knex.from('noteful_notes').select('*').where('note_id', note_id).first();
    },

    deleteNote(knex, note_id) {
        return knex('noteful_notes')
            .where({note_id})
            .delete();
    },

};

module.exports = NotesService;