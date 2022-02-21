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

export function capitalizeWords(s: string): string {
    let t = '';
    let next_uppercase = true;
    for (let i = 0; i < s.length; i++) {
        if (s[i] == ' ' || s[i] == '-' || s[i] == '/') {
            next_uppercase = true;
            t += s[i];
            continue;
        }
        if (next_uppercase) t += s[i].toUpperCase();
        else t += s[i];
        next_uppercase = false;
    }
    return t;
}

export function downloadFile(filename: string, data: string) {
    // the following code is partly taken from https://stackoverflow.com/questions/5143504/how-to-create-and-download-an-xml-file-on-the-fly-using-javascript/16751704
    const pom = document.createElement('a');
    const blob = new Blob([data], { type: 'text/plain' });
    pom.setAttribute('href', window.URL.createObjectURL(blob));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true;
    pom.classList.add('dragout');
    pom.click();
}
