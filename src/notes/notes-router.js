const path = require('path');
const express = require('express');
const { featurePolicy } = require('helmet');
const xss = require('xss');
const NotesService = require('./notes-service');

const noteRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  note_id: note.note_id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  folder_id: note.folder_id,
  modified: note.modified
});

noteRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(note => {
        res.json(note.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    console.log("Post notes " + req.body);
    const { note_name, content, folder_id } = req.body;
    const newNote = { note_name, content, folder_id };

    for( const [key, value] of Object.entries(newNote)) {
        if( value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body`}
            });
        }
    }

    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.note_id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route('/:note_id')
  .all((req, res, next) => {
         NotesService.getById(
           req.app.get('db'),
           req.params.note_id
         )
           .then(note => {
                if (!note) {
                return res.status(404).json({
                    error: { message: `Note doesn't exist` }
                });
                }
                res.note = note; // save the note for the next middleware
                next(); // don't forget to call next so the next middleware happens!
           })
           .catch(next);
    })
  .get((req, res, next) => {
        res.json(serializeNote(res.note));
  })
  .delete( (req, res, next) => {
      console.log('in router for delete note');
      NotesService.deleteNote(
          req.app.get('db'),
          req.params.note_id
      )
      .then( () => {
          res.status(204).end();
      })
      .catch(next);
  });

module.exports = noteRouter;