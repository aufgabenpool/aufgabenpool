//******************************************************************************
//  Moodle Question Preview
//  (c) 2021 by TH Köln
//  Author: Andreas Schwenk, andreas.schwenk@th-koeln.de
//  Version: 0.01
//******************************************************************************

// This script downloads all questions from pool as moodle-xml file via puppeteer.

const fs = require("fs");
const puppeteer = require('puppeteer');
const path = require('path');

// preferences
const moodle_url = 'https://aufgabenpool.f07-its.fh-koeln.de/moodle'
const moodle_user = 'puppeteer';
const moodle_pwd = 'dGDs988S#';  // TODO: must be secret!!!!!
const course_id = 2; // TODO: this is static...
const download_path = path.resolve("../Data-tmp/") + path.sep;

const export_url = moodle_url + "/question/export.php?courseid=" + course_id;

// download question pool as moodle-xml file
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

    // goto export page
    await page.goto(
        export_url,
        {waitUntil: 'load'});

    // select Moodle-XML checkbox
    await page.click('#id_format_xml');

    // set download path
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: download_path
    });
    
    await page.click('#id_submitbutton');
    await page.waitForNavigation();

    //await page.screenshot({'path': "/Users/andi/Downloads/test-export-moodle-xml.png"});

    // wait to complete the download
    await new Promise(resolve => setTimeout(resolve, 15000));

    // destroy puppeteer
    browser.close();

    // bye..
    console.log("..ready")

})();
