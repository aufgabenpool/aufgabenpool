//******************************************************************************
//  Moodle Question Preview
//  (c) 2021 by TH Köln
//  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
//  Version: 0.01
//******************************************************************************

// Note: This script is SLOW, since we need to wait for Maxima and MathJax...

const moodle_url = 'https://aufgabenpool.f07-its.fh-koeln.de/moodle'
const moodle_user = 'puppeteer';
const moodle_pwd = 'dGDs988S#';  // TODO: must be secret!!!!!

console.log(process.argv)

if(process.argv.length != 5) {
    console.log("usage: node get_preview_img.js COURSE_ID QUESTION_ID OUTPUT_PATH")
    console.log("example: node get_preview_img.js 2 3271 ~/Downloads/xx.png")
    process.exit(-1);
}

//const course_id = 2;
const course_id = process.argv[2];
//const question_id = 3282;
const question_id = process.argv[3];
//const img_out_path = '../data/0.png';
const img_out_path = process.argv[4];

console.log(question_id)
console.log(course_id)
console.log(img_out_path)

const puppeteer = require('puppeteer');

(async() => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(moodle_url + '/login/index.php', {waitUntil: 'load'});

    const userInput = await page.waitForSelector("#username");
    await userInput.focus();
    await userInput.type(moodle_user);

    const userPassword = await page.waitForSelector("#password");
    await userPassword.focus();
    await userPassword.type(moodle_pwd);

    await page.click('#loginbtn');
    await page.waitForNavigation(); 

    await page.goto(moodle_url + '/question/preview.php?id=' + question_id + '&courseid=' + course_id, {waitUntil: 'load'});

    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for MathJax

    const questionDiv = await page.$(".content");

    const box = await questionDiv.boundingBox();
    const yoffset = 12;  // clip links at top-right position
    await questionDiv.screenshot({
        'path': img_out_path,
        'clip': {'x': box['x'], 'y': box['y']+yoffset, 
                 'width': box['width'], 'height': box['height']-yoffset}
    });

    //await page.screenshot({path: 'screenshot-test.png'});

    browser.close();

    console.log("..ready")
})();
