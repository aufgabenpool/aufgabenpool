/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import axios from 'axios';

import { formatTagAsTitle, downloadFile } from './help';
import { Pool, PoolMode } from './pool';

export class Exercise {
    moodleID = 0;
    moodleCategory = '';
    title = '';
    tags: string[] = [];
    type = '';
    pool: Pool = null;

    private createTopicHierarchyHTML(): string {
        let html = '';
        for (const tag of this.tags) {
            if (tag.startsWith('te_')) {
                if (html.length > 0) html += '&raquo; ';
                html +=
                    '<span class="">' +
                    formatTagAsTitle(tag.substring(5)) +
                    '</span>&nbsp;';
            }
        }
        return html;
    }

    private createTagsHTML(): string {
        let html = '';
        const category = ['type_', 'bloom_', 'maier_', 'praxiserprobt_'];
        const categoryColor = ['#000000', '#e85b22', '#b42b83', '#000000'];
        for (let i = 0; i < category.length; i++) {
            for (const tag of this.tags) {
                if (tag.startsWith(category[i])) {
                    html +=
                        '<span class="badge rounded-pill"' +
                        ' style="cursor:pointer;background-color:' +
                        categoryColor[i] +
                        ';">' +
                        this.pool.getTaxonomyNames()[tag] +
                        '</span>&nbsp;';
                }
            }
        }
        return html;
    }

    createHTMLElement(pool: Pool): HTMLElement {
        this.pool = pool;
        const root = document.createElement('div');
        root.classList.add('col', 'bg-white', 'rounded', 'my-4');
        const card = document.createElement('div');
        root.appendChild(card);
        card.classList.add('card-body', 'm-0', 'p-2');
        // topic
        const topic = this.createTopicHierarchyHTML();
        let p = document.createElement('p');
        card.appendChild(p);
        p.classList.add('text-center', 'card-text', 'mx-2', 'my-0', 'my-0');
        p.innerHTML = topic;
        // title
        const title = this.title;
        const h2 = document.createElement('h2');
        card.appendChild(h2);
        h2.classList.add('my-0', 'py-3', 'text-center');
        h2.innerHTML = '<b>' + title + '</b>';
        // tags
        const tags = this.createTagsHTML();
        p = document.createElement('p');
        card.appendChild(p);
        p.classList.add('text-center', 'card-text');
        p.innerHTML = tags;
        // preview image
        const div = document.createElement('p');
        card.appendChild(div);
        div.classList.add('pt-2');
        const img = document.createElement('img');
        div.appendChild(img);
        img.classList.add('img-fluid');
        img.src = 'data/' + this.moodleID + '_0.png';

        // button row
        const buttonRow = document.createElement('div');
        root.appendChild(buttonRow);
        buttonRow.classList.add('row', 'mx-1', 'my-2');
        const buttonCol = document.createElement('div');
        buttonRow.appendChild(buttonCol);
        buttonCol.classList.add('col', 'mx-0', 'my-2', 'text-center');
        // preview buttons
        const buttonGroupPreview = document.createElement('div');
        buttonCol.appendChild(buttonGroupPreview);
        buttonGroupPreview.classList.add('btn-group');
        // TODO: role="group"
        const previewButtons: HTMLButtonElement[] = [];
        for (let i = 0; i < 3; i++) {
            const button = document.createElement('button');
            previewButtons.push(button);
            buttonGroupPreview.appendChild(button);
            button.type = 'button';
            button.classList.add('btn', 'btn-outline-dark', 'btn-sm');
            button.setAttribute('data-toggle', 'tooltip');
            button.setAttribute('data-placement', 'top');
            /*button.title = i < 3 ? 'Vorschau ' + (i + 1) : 'Lösungsweg';
            if (i == 0) button.classList.add('active');
            button.innerHTML =
                i == 3 ? '<i class="far fa-lightbulb"></i>' : '' + (i + 1);*/
            button.title = 'Vorschau ' + (i + 1);
            if (i == 0) button.classList.add('active');
            button.innerHTML = '' + (i + 1);
        }
        for (let i = 0; i < 3; i++) {
            const button = previewButtons[i];
            const this_ = this;
            button.addEventListener('click', function () {
                /*if (i == 3) {
                    alert('unimplemented');
                    return;
                }*/
                for (let k = 0; k < 3; k++) {
                    if (i == k) previewButtons[k].classList.add('active');
                    else previewButtons[k].classList.remove('active');
                }
                img.src = 'data/' + this_.moodleID + '_' + i + '.png';
            });
        }
        // spacing between button groups
        let spacing = document.createElement('span');
        spacing.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
        buttonCol.appendChild(spacing);
        // action buttons
        const buttonGroupActions = document.createElement('div');
        buttonCol.appendChild(buttonGroupActions);
        buttonGroupActions.classList.add('btn-group');
        const actionButtons: HTMLButtonElement[] = [];
        const tooltip = [
            this.pool.getMode() == PoolMode.SelectionMode
                ? 'Zum Aufgabenblatt hinzufügen'
                : 'Vom Aufgabenblatt entfernen',
            'Aufgabe im Format Moodle-XML herunterladen',
            'Aufgabe in Moodle editieren (eingeschränkter Zugriff)',
            'Fehler melden',
        ];
        const icons = [
            this.pool.getMode() == PoolMode.SelectionMode
                ? '<i class="fa fa-book"></i>'
                : '<i class="fa fa-ban"></i>',
            '<i class="fa fa-download" aria-hidden="true"></i>',
            '<i class="fa fa-edit" aria-hidden="true"></i>',
            '<i class="fas fa-bug" aria-hidden="true"></i>',
        ];
        for (let i = 0; i < tooltip.length; i++) {
            const button = document.createElement('button');
            actionButtons.push(button);
            buttonGroupActions.appendChild(button);
            button.type = 'button';
            button.classList.add('btn', 'btn-outline-dark', 'btn-sm');
            button.setAttribute('data-toggle', 'tooltip');
            button.setAttribute('data-placement', 'top');
            button.title = tooltip[i];
            button.innerHTML = icons[i];
        }
        const this_ = this;
        // action for add/remove to/from worksheet button
        actionButtons[0].addEventListener('click', function () {
            if (this_.pool.getMode() == PoolMode.SelectionMode) {
                this_.pool.addToWorksheet(this_);
            } else {
                this_.pool.removeFromWorksheet(this_);
            }
        });
        // action for download as Moodle-XML button
        actionButtons[1].addEventListener('click', function () {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const path = 'data/' + this_.moodleID + '.xml?time=' + timestamp;
            // download
            axios
                .get(path)
                .then(function (response) {
                    const data = response.data;
                    const filename = 'pool_download_' + this_.moodleID + '.xml';
                    downloadFile(filename, data);
                })
                .catch(function (error) {
                    console.error(error);
                });
            // statistics
            axios
                .post(
                    'download.php',
                    new URLSearchParams({
                        moodleID: '' + this_.moodleID,
                    }),
                )
                .then(function (response) {
                    const data = response.data;
                })
                .catch(function (error) {
                    console.error(error);
                });
        });
        // action for editing in Moodle
        actionButtons[2].addEventListener('click', function () {
            const url = this_.pool.getConfig().moodleEditPath + this_.moodleID;
            window.open(url);
        });
        // action for bug reporting
        actionButtons[3].addEventListener('click', function () {
            pool.openBugReportingModal(this_);
        });
        // spacing between button groups
        spacing = document.createElement('span');
        spacing.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
        buttonCol.appendChild(spacing);
        // rating button group
        const buttonGroupRating = document.createElement('div');
        buttonCol.appendChild(buttonGroupRating);
        buttonGroupRating.classList.add('btn-group');
        const ratingButtons: HTMLButtonElement[] = [];
        for (let i = 0; i < 5; i++) {
            const button = document.createElement('button');
            ratingButtons.push(button);
            buttonGroupRating.appendChild(button);
            button.type = 'button';
            button.classList.add('btn', 'btn-outline-dark', 'btn-sm');
            button.setAttribute('data-toggle', 'tooltip');
            button.setAttribute('data-placement', 'top');
            button.title = 'Bewertung: ' + (i + 1) + '/5 Sterne';
            //if (i == 0) button.classList.add('active');
            button.innerHTML = '<i class="far fa-star"></i>';
            button.onclick = function (e) {
                for (let k = 0; k < 5; k++) {
                    if (k <= i)
                        ratingButtons[k].innerHTML =
                            '<i class="fa-solid fa-star"></i>';
                    else
                        ratingButtons[k].innerHTML =
                            '<i class="far fa-star"></i>';
                }
                axios
                    .post(
                        'rating.php',
                        new URLSearchParams({
                            moodleID: '' + this_.moodleID,
                            stars: '' + (i + 1),
                        }),
                    )
                    .then(function (response) {
                        const data = response.data;
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            };
        }
        /*// spacing between button groups
        spacing = document.createElement('span');
        spacing.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
        buttonCol.appendChild(spacing);*/

        // "TODO: https://aufgabenpool.f07-its.fh-koeln.de/moodle/question/type/stack/questiontestrun.php?questionid=???&courseid=2
        return root;
    }
}
