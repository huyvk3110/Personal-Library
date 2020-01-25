/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const COLLECTION = 'books';
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection(COLLECTION)
        .find({})
        .toArray()
        .then(data => res.json(data.map(o => ({ ...o, commentcount: o.comments && o.comments.length || 0 }))))
        .catch(error => res.json({ error }))
    })

    .post(function (req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) return res.json({ error: 'error' });
      db.collection(COLLECTION).insertOne({ title })
        .then(data => res.json(data.ops[0]))
        .catch(error => res.json({ error }))
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      db.collection(COLLECTION)
        .remove()
        .then(data => res.send('complete delete successful'))
        .catch(error => res.json({ error }))
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection(COLLECTION).findOne({ _id: new ObjectId(bookid) })
        .then(data => res.json({ ...data, comments: data.comments || [] }))
        .catch(error => res.json({ error }));
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      db.collection(COLLECTION).findOne({ _id: new ObjectId(bookid) })
        .then(data => {
          db.collection(COLLECTION).updateOne({ _id: new ObjectId(bookid) }, { ...data, comments: data.comments ? [...data.comments, comment] : [comment] })
            .then(data => res.json(data.ops[0]))
            .catch(error => res.json({ error }))
        })
        .catch(error => res.json({ error }))
    })

    .delete(function (req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.collection(COLLECTION).remove({ _id: new ObjectId(bookid) })
        .then(data => res.send('complete delete successful'))
        .catch(error => res.json({ error }))
    });

};
