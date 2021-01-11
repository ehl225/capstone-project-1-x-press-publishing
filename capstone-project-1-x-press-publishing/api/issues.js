const express = require('express');
const issuesRouter = express.Router({ mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get('SELECT * FROM Issue WHERE id = $issueId', (error, issue) => {
        if (error) {
            next(error);
        } else if (issue) {
            req.issue = issue;
            next();
        } else {
            return res.status(404).send();
        }
    })
});

issuesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Issue', (error, issues) => {
        if(error) {
            next(error);
        } else {
            res.status(200).json({ issues: issues});
        }
    });
});
issuesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const issueNumber = req.body.series.issueNumber;
    const publicationDate = req.body.series.publicationDate;
    const artistId = req.body.artist.id;
    const seriesId = req.body.series.id;

    if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.status(400).send();
    } else {
        const sql = 'INSERT INTO Issues (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
        const values = { $name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId: seriesId};
        db.run(sql, values, function(error) {
           if (error) {
               next(error);
           } else {
               db.get(`SELECT * FROM Issue WHERE id = ${this.lastId}`, (error, issue) => {
                   res.status(201).send({ issue: issue});
               });
           }
        });   
    }
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.series.name;
    const issueNumber = req.params.issueNumber;
    const publicationDate = req.body.series.publicationDate;
    const artistId = req.body.artist.id;
    const seriesId = req.body.series.id;
    if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.status(400).send();
    } else {
        const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId';
        const values = { $name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId: seriesId};
        db.run(sql, values, (error) => {
            if(error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Issue WHERE id = ${seriesId}`, (error, issue) => {
                    res.status(200).send({ issue: issue});
                })
            }
        });
    }
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    const issueId = req.params.issueId;
    db.run(`DELETE FROM Issue WHERE id = ${issueId}`, (error) => {
        if (error) {
            next(error);
        } else {
            res.status(204).send();
        }
    })
})
module.exports = issuesRouter;