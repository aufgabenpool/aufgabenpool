const puppeteer = require('puppeteer');

(async() => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://sell.f07-its.fh-koeln.de/moodle/login/index.php', {waitUntil: 'load'});

    const userInput = await page.waitForSelector("#username");
    await userInput.focus();
    await userInput.type("puppeteer");

    const userPassword = await page.waitForSelector("#password");
    await userPassword.focus();
    await userPassword.type("dGDs988S#");   // TODO: must be secret!!!!!

    await page.click('#loginbtn');
    await page.waitForNavigation(); 

    await page.goto('https://sell.f07-its.fh-koeln.de/moodle/question/preview.php?id=3282&courseid=2', {waitUntil: 'load'});

    
    /*const questionDiv = await page.waitForSelector(".content");
    console.log(questionDiv.innerHTML);*/

    /*let xxxx = await page.evaluate(() => {
        let element = document.querySelector(".content");
        return element;
    });
    console.log(xxxx);

    await xxxx.screenshot({path: 'screenshot-test-2.png'});*/

    const elements = await page.$$('*');
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        console.log(element.class);
    }

    /*let xxxx = await page.evaluate(() => {
        //let questionDivId = null;
        //let elements = document.getElementsByClassName('formulation clearfix');
        let elements = document.getElementsByClassName('content');
        //for (let element of elements)
            //questionDivId = element;
        //return questionDivId;
        //return JSON.stringify(elements[0], null, 4)
        //return elements[0].innerHTML;
        return elements[0].id;
    });

    console.log(xxxx);*/
    //console.log(JSON.stringify(xxxx, null, 4));

    //username
    //password
    //loginbtn

    await page.screenshot({path: 'screenshot-test.png'});


    /*// Type our query into the search bar
    await page.focus('.js-search-field');
    await page.type('puppeteer');

    // Submit form
    await page.press('Enter');

    // Wait for search results page to load
    await page.waitForNavigation({waitUntil: 'load'});


    console.log('FOUND!', page.url());

    // Extract the results from the page
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('.result-link a'));
      return anchors.map(anchor => anchor.textContent);
    });
    console.log(links.join('\n'));*/

    browser.close();

})();
