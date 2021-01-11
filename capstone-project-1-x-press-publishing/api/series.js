const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = require('./issues.js');
seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = $seriesId`, 
    { $seriesId: seriesId }, (error, series) => {
        if (error) {
            next(error);
        } else if (series) {
            req.series = series;
            next();
        } else {
            res.status(404).send();
        }
    });
});

seriesRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Series", (error, series) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({ series: series});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
        res.status(200).json({ series: req.series});
    });

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if (!name || ! description) {
        return res.status(400).send();
    } else {
        db.run('INSERT INTO Series (name, description) VALUES ($name, $description)', 
            {   $name: name, $description: description}, function(error) {
                if (error) {
                    next(error);
                } 
                db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, newSeries) => {
                    res.status(201).send({ series: newSeries});
                });
            });
    }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const seriesId = req.params.seriesId;
    if (!name || ! description) {
        return res.status(400).send();
    } else {
        db.run('UPDATE Series SET name = $name, description = $description WHERE id = $seriesId', { $seriesId: seriesId, $name: name, $description: description}, function(error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (error, updatedSeries) => {
                    res.status(200).send({ series: updatedSeries});
                });
        }});
    }
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const seriesId = req.params.seriesId;
    db.get(`SELECT * FROM Issue WHERE id = ${seriesId}`, (error, issue) => {
        if (error) {
            next(error);
        } else if (issue) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Series WHERE id = ${seriesId}`, (error) => {
                if (error) {
                    next(error); 
                } else {
                    res.status(204).send();
                }
            });
        }
    });
});
    

module.exports = seriesRouter;
