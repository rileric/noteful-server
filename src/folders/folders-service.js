const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('noteful_folders');
    },

    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('noteful_folders')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    getById(knex, folder_id) {
        return knex.from('noteful_folders').select('*').where('folder_id', folder_id).first();
    },

    deleteFolders(knex, folder_id) {
        return knex('noteful_folders')
            .where({folder_id})
            .delete();
    },

    updateFolders(knex, id, newFoldersFields) {
        return knex('noteful_folders')
            .where({folder_id})
            .update(newFoldersFields);
    },
};

module.exports = FoldersService;