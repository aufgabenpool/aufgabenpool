const fs = require('fs');
const mysql = require('mysql');
const puppeteer = require('puppeteer');

// connect to SQL-database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'moodle',
    password: 'moodle', // your moodle DB should accessible ONLY from localhost!
    database: 'moodle',
    multipleStatements: false,
});

let query = 'SELECT id, questiontext FROM mdl_question;';
let question_ids = [];
connection.query(query, [], function (error, results, fields) {
    for (const entry of results) {
        question_ids.push(entry.id);
    }

    if (fs.existsSync('preview') == false)
        fs.mkdirSync('preview', { recursive: true });
    fs.writeFileSync('preview/questions.txt', question_ids.join(','));

    let must_update_ids = [];

    for (const entry of results) {
        let old_question_text = '';
        let new_question_text = entry.questiontext;
        let path = 'preview/' + entry.id + '.txt';
        let pathImg = 'preview/' + entry.id + '.png';
        if (fs.existsSync(path)) {
            old_question_text = fs.readFileSync(path, { encoding: 'utf-8' });
        }
        if (
            old_question_text !== new_question_text ||
            fs.existsSync(pathImg) == false
        ) {
            fs.writeFileSync(path, new_question_text, { encoding: 'utf-8' });
            console.log(
                'must retake screenshot for question ' + entry.id + '.',
            );
            must_update_ids.push(entry.id);
        } else {
            console.log(
                'screenshot for question ' + entry.id + ' is up to date.',
            );
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////
    const config = JSON.parse(fs.readFileSync('../converter/config.json'));
    const moodle_url = config['moodle_url'];
    const moodle_user = config['moodle_puppeteer_user'];
    const moodle_pwd = config['moodle_puppeteer_password'];

    // https://aufgabenpool.th-koeln.de/moodle/question/bank/previewquestion/preview.php?id=5900

    // take screenshots
    (async () => {
        // init puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
        });
        // goto login page
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000);
        await page.goto(moodle_url + '/login/index.php', {
            waitUntil: 'load',
            timeout: 0,
        });
        // login with user data
        const userInput = await page.waitForSelector('#username');
        await userInput.focus();
        await userInput.type(moodle_user);
        const userPassword = await page.waitForSelector('#password');
        await userPassword.focus();
        await userPassword.type(moodle_pwd);
        await page.click('#loginbtn');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        for (let question_id of must_update_ids) {
            console.log(
                'taking screenshot for question ' + question_id + ' ...',
            );
            let screenshot_path = 'preview/' + question_id + '.png';
            try {
                // goto question preview
                await page.goto(
                    moodle_url +
                        '/question/bank/previewquestion/preview.php?id=' +
                        question_id,
                    { waitUntil: 'load', timeout: 0 },
                );
                // wait for MathJax rendering
                await new Promise((resolve) => setTimeout(resolve, 1500));

                // remove upper-right links (https://stackoverflow.com/questions/50867065/puppeteer-removing-elements-by-class)
                let div_selector_to_remove = '.questiontestslink';
                await page.evaluate((sel) => {
                    var elements = document.querySelectorAll(sel);
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }, div_selector_to_remove);

                // take screenshot
                const questionDiv = await page.$('.content');
                const box = await questionDiv.boundingBox();
                const yoffset = 12 + 3; // clip text at top-right position
                await questionDiv.screenshot({
                    path: screenshot_path,
                    clip: {
                        x: box['x'],
                        y: box['y'] + yoffset,
                        width: box['width'],
                        height: box['height'] - yoffset,
                    },
                });
            } catch (e) {
                console.log(
                    'failed to get screenshot for exercise ID ' + question_id,
                );
                console.log('Error: ');
                console.log(e);
            }
        }

        // destroy puppeteer
        browser.close();
        // bye..
        console.log('..ready');

        connection.destroy();
        process.exit(0);
    })();
});
