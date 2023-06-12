// project: "Aufgabenpool: Digitaler Aufgabenpool Mathematik"
// author: Andreas Schwenk, andreas.schwenk@th-koeln.de
// license: GPLv3
// description: question editing tool (server)

// This server listens to port 3000.
// You may need to set up an Apache2 proxy server accordingly.

// Show all process that listen to port 3000 in Debian:
//   apt install net-tools
//   netstat -ltnp | grep -w ':3000'

// import dependencies
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

// log
console.log('Aufgabenpool Editor, 2022 by Andreas Schwenk, TH Koeln');
console.log('Started: ' + new Date().toLocaleString());

// connect to SQL-database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'moodle',
    password: 'moodle', // your moodle DB should accessible ONLY from localhost!
    database: 'moodle',
    multipleStatements: false,
});

// init express js
const app = express();

// create the "application"
app.use(
    session({
        secret: 'secret',
        key: 'myCookie',
        cookie: { httpOnly: false, sameSite: true },
        resave: true,
        saveUninitialized: true,
    }),
);

// express js preferences
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/preview', express.static('preview')); // handle static files in the preview directory

// get root HTML file
app.get('/', (request, response) => {
    response.sendFile('index.html', { root: __dirname });
});

// handler to read all question categories from Moodle database
app.get('/categories', (request, response) => {
    if (
        typeof request.session.username === 'undefined' ||
        request.session.username.length == 0
    ) {
        response.send({});
        response.end();
        return;
    }
    // read access file (TODO: must be improved!)
    let access = [];
    let admins = [];
    let is_admin = false;
    if (fs.existsSync('admins.txt')) {
        let lines = fs.readFileSync('admins.txt', 'utf-8').split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line.length == 0 || line.startsWith('#')) continue;
            let tokens = line.split(',');
            for (let token of tokens) {
                if (parseInt(token) == request.session.userid) {
                    console.log('==admin==');
                    is_admin = true;
                }
            }
        }
    }
    if (fs.existsSync('access.txt')) {
        let lines = fs.readFileSync('access.txt', 'utf-8').split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line.length == 0 || line.startsWith('#')) continue;
            let tokens = line.split(';');
            if (tokens.length < 2) continue;
            access.push({
                user_id: parseInt(tokens[0].trim()),
                course_category: parseInt(tokens[1].trim()),
            });
        }
    }
    console.log('access-list:');
    console.log(access);
    console.log('userid:');
    console.log(request.session.userid);

    // TODO: only get categories that current user is allowed to read/write!!!!!
    let query = 'SELECT id, parent, name FROM mdl_question_categories;';
    let categories = [];
    let hierarchy = {};
    connection.query(query, [], function (error, results, fields) {
        for (const entry of results) {
            categories.push({
                id: entry.id,
                parent: entry.parent,
                name: entry.name,
            });
            hierarchy[entry.id] = entry.parent;
        }
        if (!is_admin) {
            //let top_category = get_top_category(hierarchy, 161);
            categories = filter_access(
                request.session.userid,
                access,
                categories,
                hierarchy,
            );
        }

        response.send(categories);
        response.end();
    });
});

function get_top_category(hierarchy, id) {
    let i = 0;
    let old_id = id;
    while (id != 0) {
        old_id = id;
        id = hierarchy[id];
        i++;
        if (i > 100) return -1;
    }
    return old_id;
}

function filter_access(user_id, access_list, categories, hierarchy) {
    let new_access_list = [];
    for (let entry of categories) {
        let top = get_top_category(hierarchy, entry.id);
        if (top < 0) continue;
        new_access_list.push(entry);
    }
    console.log('filtered access list: ' + new_access_list);
    return new_access_list;
}

// handler to read all tags from Moodle database
app.post('/taglist', (request, response) => {
    if (
        typeof request.session.username === 'undefined' ||
        request.session.username.length == 0
    ) {
        response.send({});
        response.end();
        return;
    }
    let query = 'SELECT id, name, rawname FROM mdl_tag ORDER BY NAME;';
    let taglist = [];
    connection.query(query, [], function (error, results, fields) {
        // TODO: error handling
        for (const entry of results) {
            taglist.push({
                id: entry.id,
                name: entry.name,
                rawname: entry.rawname,
            });
        }
        response.send(taglist);
        response.end();
    });
});

// handler to create a new tag in Moodle database
app.post('/createTag', (request, response) => {
    if (
        typeof request.session.username === 'undefined' ||
        request.session.username.length == 0
    ) {
        response.send({});
        response.end();
        return;
    }
    const level = request.body.level;
    const userId = request.session.userid;
    const tagnameraw = mysql.escape('TE:' + level + ':' + request.body.tagname);
    const tagname = tagnameraw.toLowerCase();
    const unixTimeStamp = Math.floor(Date.now() / 1000);
    let query =
        'INSERT INTO mdl_tag (userid, tagcollid, name, rawname, isstandard, description, descriptionformat, flag, timemodified) VALUES (userid, 1, ' +
        tagname +
        ', ' +
        tagnameraw +
        ', 0, NULL, 0, 0, ' +
        unixTimeStamp +
        ')';
    connection.query(query, [], function (error, results, fields) {
        if (error) {
            response.send('ERROR');
            response.end();
            return;
        }
        response.send('OK');
        response.end();
    });
});

// handler write tags of a question into the Moodle database
app.post('/writeTags', (request, response) => {
    if (
        typeof request.session.username === 'undefined' ||
        request.session.username.length == 0
    ) {
        response.send({});
        response.end();
        return;
    }
    // TODO: check, if user is permitted to write question
    const questionId = request.body.questionId;
    const questionTagIds = request.body.questionTagIds;

    console.log('user ' + request.session.username);
    console.log('timestamp ' + new Date().toLocaleString());
    console.log(questionId);
    console.log(questionTagIds);

    // TODO: mysql.escape(..) !!

    // delete old tags
    const query = 'DELETE FROM mdl_tag_instance WHERE itemid=' + questionId;
    //console.log(query);
    connection.query(query, [], function (error, results, fields) {
        if (error) {
            console.log('failed to delete tags from question ' + questionId);
            response.send('ERROR');
            response.end();
            return;
        }
        // insert new tags
        const unixTimeStamp = Math.floor(Date.now() / 1000);
        let query =
            'INSERT INTO mdl_tag_instance (tagid, component, itemtype, itemid, contextid, tiuserid, ordering, timecreated, timemodified) VALUES ';
        for (let i = 0; i < questionTagIds.length; i++) {
            const tagid = questionTagIds[i];
            const ordering = i;
            if (i > 0) query += ',';
            query +=
                '(' +
                tagid +
                ", 'core_question', 'question', " +
                questionId +
                ', 1, 0, ' +
                ordering +
                ', ' +
                unixTimeStamp +
                ', ' +
                unixTimeStamp +
                ')';
        }
        //console.log(query);
        connection.query(query, [], function (error, results, fields) {
            if (error) {
                console.log(
                    'failed to add tag ' + tagid + ' to question ' + questionId,
                );
                response.send('ERROR');
                response.end();
                return;
            }
            response.send('OK');
            response.end();
        });
    });
});

// handler to read all questions from Moodle database
app.post('/questions', (request, response) => {
    if (
        typeof request.session.username === 'undefined' ||
        request.session.username.length == 0
    ) {
        response.send({});
        response.end();
        return;
    }

    // TODO: only get questions valid for user/course

    let questions = {};

    const categoryId = mysql.escape(request.body.categoryId);

    // Moodle 3:
    // const query = 'SELECT id, category, name FROM mdl_question WHERE category=' + categoryId;

    // Moodle 4:
    const query =
        'SELECT mdl_question.id, mdl_question_bank_entries.questioncategoryid AS category, mdl_question.name, mdl_question_versions.version, mdl_question_versions.questionbankentryid ' +
        'FROM mdl_question ' +
        'INNER JOIN mdl_question_versions ON mdl_question.id=mdl_question_versions.questionid ' +
        'INNER JOIN mdl_question_bank_entries ON mdl_question_versions.questionbankentryid=mdl_question_bank_entries.id ' +
        'WHERE mdl_question_bank_entries.questioncategoryid=' +
        categoryId +
        ' ORDER BY mdl_question_versions.questionbankentryid ASC, mdl_question_versions.version DESC';

    connection.query(query, [], function (error, results, fields) {
        const questionBankEntryIds = new Set();
        for (const result of results) {
            if (questionBankEntryIds.has(result.questionbankentryid)) {
                // skip old versions of question
                continue;
            }
            questions[parseInt(result.id)] = {
                id: result.id,
                category: result.category,
                name: result.name,
                tags: {},
            };
            questionBankEntryIds.add(result.questionbankentryid);
        }
        const query2 =
            'SELECT mdl_tag_instance.itemid, mdl_tag_instance.tagid, mdl_tag.name, mdl_tag.rawname FROM mdl_tag_instance INNER JOIN mdl_tag ON mdl_tag_instance.tagid=mdl_tag.id ORDER BY mdl_tag_instance.itemid;';
        connection.query(query2, [], function (error, results, fields) {
            // TODO: error handling
            for (const result of results) {
                let questionId = parseInt(result.itemid);
                if (questionId in questions) {
                    questions[questionId]['tags'][parseInt(result.tagid)] = {
                        name: result.name,
                        rawname: result.rawname,
                    };
                }
            }
            //console.log(questions['5141']);
            response.send(questions);
            response.end();
        });
    });
});

// login handler
app.post('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const query =
        'SELECT id, password FROM mdl_user WHERE username=' +
        mysql.escape(username) +
        ';';

    console.log(query);

    connection.query(query, [], function (error, results, fields) {
        console.log('RESULTS:');
        console.log(results);

        if (error || results.length == 0) {
            console.log('ERROR:');
            console.log(error);
            request.session.username = '';
            response.send('LOGIN FEHLGESCHLAGEN');
            response.end();
            return;
        }
        const passwordHashFromDB = results[0].password;
        if (bcrypt.compareSync(password, passwordHashFromDB)) {
            request.session.username = username;
            request.session.userid = parseInt(results[0].id);
            console.log(
                'user ' +
                    username +
                    ' (' +
                    request.session.userid +
                    ') logged in.',
            );
            response.send('LOGIN OK');
        } else {
            request.session.username = '';
            request.session.userid = -1;
            response.send('FEHLERHAFTE LOGINDATEN');
        }
        response.end();
    });
});

// logout handler
app.post('/logout', (request, response) => {
    request.session.username = '';
    request.session.userid = -1;
    response.end();
});

// start listening
app.listen(3000);
