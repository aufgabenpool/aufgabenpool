/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import { Pool, PoolMode } from './pool';

let pool: Pool = null;

const metaDataPath = 'data/meta.json';
const moodleEditPath =
    'https://aufgabenpool.th-koeln.de/' +
    'moodle/question/question.php?&courseid=2&id=';

export function selectPool() {
    const poolButton = document.getElementById('pool-button');
    const worksheetButton = document.getElementById('worksheet-button');
    poolButton.classList.remove('btn-outline-danger');
    poolButton.classList.add('btn-danger');
    worksheetButton.classList.remove('btn-danger');
    worksheetButton.classList.add('btn-outline-danger');

    const taglist = document.getElementById('taglist_div');
    taglist.style.display = 'block';

    pool.setMode(PoolMode.SelectionMode);
}

export function selectWorksheet() {
    const poolButton = document.getElementById('pool-button');
    const worksheetButton = document.getElementById('worksheet-button');
    poolButton.classList.add('btn-outline-danger');
    poolButton.classList.remove('btn-danger');
    worksheetButton.classList.add('btn-danger');
    worksheetButton.classList.remove('btn-outline-danger');

    const taglist = document.getElementById('taglist_div');
    taglist.style.display = 'none';

    pool.setMode(PoolMode.WorksheetMode);
}

export function reportBug(): void {
    pool.reportBug();
}

export function init() {
    pool = new Pool({
        metaDataPath: metaDataPath,
        moodleEditPath: moodleEditPath,
    });
    pool.import();
}
