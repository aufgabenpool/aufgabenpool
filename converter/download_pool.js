//******************************************************************************
//  Moodle Question Preview
//  (c) 2021 by TH Köln
//  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
//  Version: 0.01
//******************************************************************************

// This script downloads all questions from pool as moodle-xml file via puppeteer.

// dependencies
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

// read config
if (fs.existsSync('config.json') == false) {
    console.log(
        'ERROR: config.json not found: ' +
            'copy "config-template.json" to "config.json" ' +
            'and make changes',
    );
    process.exit(-1);
}
const config = JSON.parse(fs.readFileSync('config.json'));
const moodle_url = config['moodle_url'];
const moodle_user = config['moodle_puppeteer_user'];
const moodle_pwd = config['moodle_puppeteer_password'];

// preferences
const moodle_major_version = 4; // switch to 3 for moodle 3.x
const course_id = 2; // TODO: this is static...
const download_path = path.resolve('../data-tmp/') + path.sep;

let export_url = '';
if (moodle_major_version == 3)
    export_url = moodle_url + '/question/export.php?courseid=' + course_id;
else
    export_url =
        moodle_url +
        '/question/bank/exportquestions/export.php?courseid=' +
        course_id;

// download question pool as moodle-xml file
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

    // goto export page
    await page.goto(export_url, { waitUntil: 'load', timeout: 0 });

    // >>>>>>>>>>>>>>>>>>>>>><
    /*await page.screenshot({
        path: '/Users/andi/Downloads/test-export-moodle-xml.png',
    });
    process.exit(-1);*/
    // >>>>>>>>>>>>>>>>>>>>>><

    // select Moodle-XML checkbox
    await page.click('#id_format_xml');

    /*await page.screenshot({
        path: '/Users/andi/Downloads/test-export-moodle-xml.png',
    });*/

    // set download path
    /*await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: download_path,
    });*/
    // set download path ... puppeteer 15: https://github.com/berstend/puppeteer-extra/issues/651
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: download_path,
    });

    // click on export button
    await page.click('#id_submitbutton');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    /*await page.screenshot({
        path: '/Users/andi/Downloads/test-export-moodle-xml2.png',
    });*/

    // wait to complete the download
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // destroy puppeteer
    browser.close();

    // bye..
    console.log('..ready');
})();
