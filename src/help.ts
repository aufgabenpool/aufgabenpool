/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import * as bootstrap from 'bootstrap';

let tooltipList: bootstrap.Tooltip[] = [];

export function updateTooltips() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-toggle="tooltip"]'),
    );
    tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            container: 'body',
            trigger: 'hover',
        });
    });
}

export function hideTooltips() {
    for (const tooltip of tooltipList) {
        tooltip.hide();
    }
}

const lowercaseWords = [
    'der',
    'die',
    'das',
    'des',
    'in',
    'im',
    'und',
    'auf',
    'mit',
    'durch',
    'mittels',
    'bei',
    'zwischen',
];

export function formatTagAsTitle(src: string): string {
    // examples:
    //  "Bestimmtes integral" -> "Bestimmtes Integral"
    //  "FestverzinslicheWertpapiere" -> "Festverzinsliche Wertpapiere"
    //  "Test1" -> "Test 1"
    let result = '';
    const n = src.length;
    for (let i = 0; i < n; i++) {
        const ch = src[i];
        const chPrev = i == 0 ? '' : src[i - 1];
        if (chPrev == ' ' || chPrev == '-' || chPrev == '/') {
            result += ch.toUpperCase();
        } else if (isLowercase(chPrev) && isUppercase(ch)) {
            result += ' ' + ch;
        } else if (isNumber(ch)) {
            result += ' ' + ch;
        } else {
            result += ch;
        }
    }
    result = result.replace(/1d/g, '1D');
    result = result.replace(/2d/g, '2D');
    result = result.replace(/3d/g, '3D');
    result = result.replace(/4d/g, '4D');
    const words = result.split(' ');
    const wordsOut: string[] = [];
    for (const word of words) {
        if (lowercaseWords.includes(word.toLocaleLowerCase()))
            wordsOut.push(word.toLowerCase());
        else wordsOut.push(word);
    }
    return wordsOut.join(' ');
}

function isNumber(ch: string): boolean {
    if (ch.length < 1) return false;
    return ch[0] >= '0' && ch[0] <= '9';
}

function isLowercase(ch: string): boolean {
    if (ch.length < 1) return false;
    return ch[0] >= 'a' && ch[0] <= 'z';
}

function isUppercase(ch: string): boolean {
    if (ch.length < 1) return false;
    return ch[0] >= 'A' && ch[0] <= 'Z';
}

export function downloadFile(filename: string, data: string) {
    // the following code is partly taken from
    // https://stackoverflow.com/questions/5143504/how-to-create-and-download-an-xml-file-on-the-fly-using-javascript/16751704
    const pom = document.createElement('a');
    const blob = new Blob([data], { type: 'text/plain' });
    pom.setAttribute('href', window.URL.createObjectURL(blob));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true;
    pom.classList.add('dragout');
    pom.click();
}
