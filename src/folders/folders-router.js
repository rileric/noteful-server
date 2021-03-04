const path = require('path');
const express = require('express');
const { featurePolicy } = require('helmet');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

myDebug = console.log; // TODO

const serializeFolder = folder => ({
  folder_id: folder.folder_id,
  folder_name: xss(folder.folder_name),
});

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        myDebug(folders);
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const folder_name  = req.body;
    const newFolder = folder_name;

    for( const [key, value] of Object.entries(newFolder)) {
        if( value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body`}
            });
        }
    }
  
    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.folder_id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route('/folder/:folder_id')
  .all((req, res, next) => {
         FoldersService.getById(
           req.app.get('db'),
           req.params.folder_id
         )
           .then(folder => {
                if (!folder) {
                  return res.status(404).json({
                      error: { message: `Folder doesn't exist` }
                  });
                }
                res.folder = folder; // save the folder for the next middleware
                next(); // don't forget to call next so the next middleware happens!
           })
           .catch(next);
    })
  .get((req, res, next) => {
        res.json(serializeFolder(res.folder));
  })
  .delete( (req, res, next) => {
      FoldersService.deleteFolder(
          req.app.get('db'),
          req.params.folder_id
      )
      .then( () => {
          res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;