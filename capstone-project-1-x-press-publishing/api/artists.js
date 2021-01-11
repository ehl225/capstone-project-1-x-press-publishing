const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE id= $artistId`, 
    { $artistId: artistId }, (error, artist) => {
        if (error) {
            next(error);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.status(404).send();
        }
        });
    });

artistsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (error, artists) => {
        if (error) {
            next(error);
        } else {
        res.status(200).json({ artists: artists });
    }});
});


artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({ artist: req.artist});
});

artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if ( !name || !dateOfBirth || !biography) {
        return res.status(400).send();
    } 
    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)' + 'VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {   $name: name, 
        $dateOfBirth: dateOfBirth, 
        $biography: biography, 
        $isCurrentlyEmployed: isCurrentlyEmployed
    };
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else { 
         db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (error, newArtist) => {
                  res.status(201).json({ artist: newArtist });
             
        });
    }});
});

artistsRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if ( !name || !dateOfBirth || !biography) {
        return res.status(400).send();
    } 
    const sql = "UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId";
    const values = { $artistId: req.params.artistId, $name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed};
    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
        db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (error, updatedArtist) => {
            res.status(200).send({ artist: updatedArtist});
         })};
});
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    const artistId = req.params.artistId;
    db.run('UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId', { $artistId: artistId},  (error) => {
        if (error) {
            next(error);
        } else {
        db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (error, updatedArtist) => {
            res.status(200).json({ artist: updatedArtist});
        });} 
    });
});
module.exports = artistsRouter;