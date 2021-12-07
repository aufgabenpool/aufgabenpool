//******************************************************************************
//  Moodle Question Preview
//  (c) 2021 by TH Köln
//  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
//  Version: 0.02
//******************************************************************************

// Note: This script is SLOW, since we need to wait for Maxima and MathJax...
// In case that "old_content_path" already contains screenshots and moodle-xml
// files in paths "img_out_path" and "old_content_path" have no diff, 
// we can simply copy old screenshots from "old_content_path" to "img_out_path".

const fs = require("fs");
const { exec } = require("child_process");
const puppeteer = require('puppeteer');

// preferences
const moodle_url = 'https://aufgabenpool.f07-its.fh-koeln.de/moodle'
const moodle_user = 'puppeteer';
const moodle_pwd = 'dGDs988S#';  // TODO: must be secret!!!!!
const course_id = 2; // TODO: this is static...
const meta_data_path = "../data-tmp/meta.json";
const img_out_path = '../data-tmp/';
const old_content_path = '../data/';
let first_exercise_id = 0;
let last_exercise_id = 1e12; // only used for debugging purposes

if(process.argv.length == 4) {
    first_exercise_id = parseInt(process.argv[2]);
    last_exercise_id = parseInt(process.argv[3]);
}

// get exercise meta data
let meta = fs.readFileSync(meta_data_path);
meta = JSON.parse(meta);
let exercises = meta["exercises"];

// take screenshots
(async() => {
    // init puppeteer
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
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
        process.stdout.write(".");
        let exercise = exercises[i];
        let question_id = exercise["id"];
        // only get screenshots if the XML file has been updated since the last sync
        let must_update = true;
        if(fs.existsSync(old_content_path + question_id + ".xml") 
                && fs.existsSync(old_content_path + question_id + "_0.png")
                && fs.existsSync(old_content_path + question_id + "_1.png")
                && fs.existsSync(old_content_path + question_id + "_2.png")) {
            let xml_old = fs.readFileSync(old_content_path + question_id + ".xml", 'utf8');
            let xml_new = fs.readFileSync(img_out_path + question_id + ".xml", 'utf8');
            must_update = xml_old !== xml_new;
        }
        if(must_update == false) {
            // copy existing image files
            for(let k=0; k<3; k++) {
                fs.copyFileSync(old_content_path + question_id + "_" + k + ".png", 
                                img_out_path + question_id + "_" + k + ".png");
            }
        } else {
            // create 3 separate screenshots (screenshots should be different 
            // for questions that include random variables)
            for(let k=0; k<3; k++) {
                let screenshot_path = img_out_path + question_id + "_" + k + ".png";
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
                    const yoffset = 12+3;  // clip text at top-right position
                    await questionDiv.screenshot({
                        'path': screenshot_path,
                        'clip': {'x': box['x'], 'y': box['y']+yoffset, 
                                'width': box['width'], 'height': box['height']-yoffset}
                    });
                } catch(e) {
                    console.log("failed to get screenshot for exercise " + i);
                }
                // postprocess screenshot (set background color transparent)
                // TODO: what happens if 'mogrify' is NOT installed???
                exec('cd ../data-tmp/ && mogrify -format png -fill "#FFFFFF" -opaque "#E7F3F5" ' 
                    + question_id + "_" + k + ".png");
            }
        }
    }
    // destroy puppeteer
    browser.close();
    // bye..
    console.log("..ready")
})();
