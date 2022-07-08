// project: "Aufgabenpool: Digitaler Aufgabenpool Mathematik"
// author: Andreas Schwenk, andreas.schwenk@th-koeln.de
// license: GPLv3
// description: question editing tool (server)

// This server listens to port 3000. You may need to set up an Apache2 proxy server.
// Show all process that listen to port 3000 on Debian:
//   apt install net-tools
//   netstat -ltnp | grep -w ':3000'

const express = require("express");
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

console.log("Aufgabenpool Editor, 2022 by Andreas Schwenk, TH Koeln");
console.log("Started: " + new Date().toLocaleString());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'moodle',
    password: 'moodle',
    database: 'moodle',
    multipleStatements: false
});

const app = express();

app.use(session({
    secret: 'secret',
    key: 'myCookie',
    cookie: { httpOnly: false, sameSite: true },
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
    response.sendFile("index.html", {root: __dirname});
});

app.get("/categories", (request, response) => {
    if(typeof request.session.username === 'undefined' || request.session.username.length == 0) {
        response.send({});
        response.end();
        return;
    }
    // TODO: only get categories that current user is allowed to read/write!!!!!
    let query = "SELECT id, parent, name FROM mdl_question_categories;";
    let categories = [];
    connection.query(query, [], function(error, results, fields) {
        for(const entry of results) {
            categories.push({
                id: entry.id,
                parent: entry.parent,
                name: entry.name
            });
        }
        response.send(categories);
        response.end();
    });
});

app.post("/taglist", (request, response) => {
    if(typeof request.session.username === 'undefined' || request.session.username.length == 0) {
        response.send({});
        response.end();
        return;
    }
    //let query = "SELECT id, name, rawname FROM mdl_tag WHERE (LOWER(name) LIKE 'te:%') ORDER BY NAME;";
    let query = "SELECT id, name, rawname FROM mdl_tag ORDER BY NAME;";
    let taglist = [];
    connection.query(query, [], function(error, results, fields) {
        // TODO: error handling
        for(const entry of results) {
            taglist.push({
                id: entry.id,
                name: entry.name,
                rawname: entry.rawname
            });
        }
        response.send(taglist);
        response.end();
    });
});

app.post("/createTag", (request, response) => {
    if(typeof request.session.username === 'undefined' || request.session.username.length == 0) {
        response.send({});
        response.end();
        return;
    }
    const level = request.body.level;
    const userId = request.session.userid;
    const tagnameraw = mysql.escape('TE:' + level + ':' + request.body.tagname);
    const tagname = tagnameraw.toLowerCase();
    const unixTimeStamp = Math.floor(Date.now()/1000);
    let query = "INSERT INTO mdl_tag (userid, tagcollid, name, rawname, isstandard, description, descriptionformat, flag, timemodified) VALUES (userid, 1, "+tagname+", "+tagnameraw+", 0, NULL, 0, 0, "+unixTimeStamp+")";
    connection.query(query, [], function(error, results, fields) {
        if (error) {
            response.send('ERROR');
            response.end();
            return;
        }
        response.send('OK');
        response.end();
    });
});

app.post("/writeTags", (request, response) => {
    if(typeof request.session.username === 'undefined' || request.session.username.length == 0) {
        response.send({});
        response.end();
        return;
    }
    // TODO: check, if user is permitted to write question
    const questionId = request.body.questionId;
    const questionTagIds = request.body.questionTagIds;

    console.log("user " + request.session.username);
    console.log("timestamp " + new Date().toLocaleString());
    console.log(questionId);
    console.log(questionTagIds);

    // TODO: mysql.esacpe(..) !!

    // delete old tags
    const query = "DELETE FROM mdl_tag_instance WHERE itemid=" + questionId;
    //console.log(query);
    connection.query(query, [], function(error, results, fields) {
        if (error) {
            console.log('failed to delete tags from question ' + questionId);
            response.send('ERROR');
            response.end();
            return;
        }
        // insert new tags
        const unixTimeStamp = Math.floor(Date.now()/1000);
        let query = "INSERT INTO mdl_tag_instance (tagid, component, itemtype, itemid, contextid, tiuserid, ordering, timecreated, timemodified) VALUES ";
        for (let i=0; i<questionTagIds.length; i++) {
            const tagid = questionTagIds[i];
            const ordering = i;
            if (i>0)
                query += ",";
            query += "(" + tagid + ", 'core_question', 'question', " + questionId + ", 1, 0, " + ordering + ", " + unixTimeStamp + ", " + unixTimeStamp + ")";
        }
        //console.log(query);
        connection.query(query, [], function(error, results, fields) {
            if (error) {
                console.log('failed to add tag ' + tagid + ' to question ' + questionId);
                response.send('ERROR');
                response.end();
                return;
            }
            response.send('OK');
            response.end();
        });

    });
});

app.post("/questions", (request, response) => {
    if (typeof request.session.username === 'undefined' || request.session.username.length == 0) {
        response.send({});
        response.end();
        return;
    }

    // TODO: only get questions valid for user/course

    let questions = {};

    const categoryId = mysql.escape(request.body.categoryId);

    const query = 'SELECT id, category, name FROM mdl_question WHERE category=' + categoryId;
    connection.query(query, [], function(error, results, fields) {
	for (const result of results) {
            questions[parseInt(result.id)] = {
                id: result.id,
                category: result.category,
                name: result.name,
                tags: {}
            };
        }
	const query2 = 'SELECT mdl_tag_instance.itemid, mdl_tag_instance.tagid, mdl_tag.name, mdl_tag.rawname FROM mdl_tag_instance INNER JOIN mdl_tag ON mdl_tag_instance.tagid=mdl_tag.id ORDER BY mdl_tag_instance.itemid;';
        connection.query(query2, [], function(error, results, fields) {
            // TODO: error handling
            for (const result of results) {
                let questionId = parseInt(result.itemid);
                if (questionId in questions) {
                    questions[questionId]['tags'][parseInt(result.tagid)] = {
                        name: result.name,
                        rawname: result.rawname
                    };
                }
            }
            //console.log(questions['5141']);
            response.send(questions);
            response.end();
        });
    });
});

app.post("/login", (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const query = 'SELECT id, password FROM mdl_user WHERE username=' + mysql.escape(username);
    connection.query(query, [], function(error, results, fields) {
        if (error) {
            request.session.username = '';
            response.send('LOGIN FEHLGESCHLAGEN');
            response.end();
            return;
        }
        const passwordHashFromDB = results[0].password;
        if(bcrypt.compareSync(password, passwordHashFromDB)) {
            request.session.username = username;
            request.session.userid = parseInt(results[0].id);
            console.log('user ' + username + ' (' + request.session.userid + ') logged in.' );
            response.send('LOGIN OK');
        } else {
            request.session.username = '';
            request.session.userid = -1;
            response.send('FEHLERHAFTE LOGINDATEN');
        }
        response.end();
    });
});

app.post("/logout", (request, response) => {
  request.session.username = '';
  request.session.userid = -1;
  response.end();
});

app.listen(3000);
