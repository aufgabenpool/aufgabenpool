//******************************************************************************
//  Moodle Question Preview
//  (c) 2021 by TH Köln
//  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
//  Version: 0.01
//******************************************************************************

// Note: This script is SLOW, since we need to wait for Maxima and MathJax...

const fs = require("fs");
const puppeteer = require('puppeteer');

// preferences
const moodle_url = 'https://sell.f07-its.fh-koeln.de/moodle'
const moodle_user = 'puppeteer';
const moodle_pwd = 'dGDs988S#';  // TODO: must be secret!!!!!
const course_id = 2; // TODO: this is static...
const meta_data_path = "../Data-tmp/meta.json";
const img_out_path = '../Data-tmp/';

let first_exercise_id = 0;
let last_exercise_id = 1e12;

if(process.argv.length == 4) {
    first_exercise_id = parseInt(process.argv[2]);
    last_exercise_id = parseInt(process.argv[3]);
}

// exercise meta data
let meta = fs.readFileSync(meta_data_path);
meta = JSON.parse(meta);
let exercises = meta["exercises"];

// take screenshots
(async() => {

    // init puppeteer
    const browser = await puppeteer.launch();

    // goto login page
    const page = await browser.newPage();
    await page.goto(moodle_url + '/login/index.php', {waitUntil: 'load'});

    // login with user data
    const userInput = await page.waitForSelector("#username");
    await userInput.focus();
    await userInput.type(moodle_user);

    const userPassword = await page.waitForSelector("#password");
    await userPassword.focus();
    await userPassword.type(moodle_pwd);

    await page.click('#loginbtn');
    await page.waitForNavigation(); 

    // for all exercises...
    for(let i=first_exercise_id; i<exercises.length && i<last_exercise_id; i++) {
        let exercise = exercises[i];
        let question_id = parseInt(exercise["importid"].substring(11));

        for(let k=0; k<3; k++) { // create 3 scrrenshot to show random behavior
            let screenshot_path = img_out_path + exercise["id"] + "_" + k + ".png";

            try {
                // goto question preview
                await page.goto(
                    moodle_url 
                    + '/question/preview.php?id=' 
                    + question_id 
                    + '&courseid=' 
                    + course_id, 
                    {waitUntil: 'load'});

                // wait for MathJax rendering
                await new Promise(resolve => setTimeout(resolve, 1500));

                // take screenshot
                const questionDiv = await page.$(".content");
                const box = await questionDiv.boundingBox();
                const yoffset = 12;  // clip links at top-right position
                await questionDiv.screenshot({
                    'path': screenshot_path,
                    'clip': {'x': box['x'], 'y': box['y']+yoffset, 
                            'width': box['width'], 'height': box['height']-yoffset}
                });
            } catch(e) {
                console.log("failed to get screenshot for exercise " + i);
            }
        
        }

    }

    // destroy puppeteer
    browser.close();

    // bye..
    console.log("..ready")

})();
