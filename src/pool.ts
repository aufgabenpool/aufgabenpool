/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import axios from 'axios';

import * as bootstrap from 'bootstrap';

import {
    downloadFile,
    formatTagAsTitle,
    hideTooltips,
    updateTooltips,
} from './help';
import { Exercise } from './exercise';
import {
    TaxonomyItem,
    TaxonomyHierarchyItem,
    TaxonomyItemType,
    TaxonomyDimensionItem,
} from './taxonomy';

let googleReCaptchaResponse = '';
function googleRecaptchaCallback(response: string): void {
    googleReCaptchaResponse = response;
}

export interface PoolConfig {
    metaDataPath: string;
    moodleEditPath: string;
}

export enum PoolMode {
    SelectionMode = 'selection-mode',
    WorksheetMode = 'worksheet-mode',
}

export class Pool {
    private config: PoolConfig;
    private mode: PoolMode = PoolMode.SelectionMode;

    private exercises: Exercise[] = [];
    private taxonomy: TaxonomyItem[] = [];
    private taxonomyHierarchyRoot: TaxonomyHierarchyItem = null;
    private taxonomyNames: { [id: string]: string } = {};
    private tagCount: { [tagname: string]: number } = {};
    private tagCountSelected: { [tagname: string]: number } = {};
    private date = '';

    private worksheetExercises: Exercise[] = [];
    private worksheetMoodleXml = '';

    private bugReportingModal: bootstrap.Modal = null;
    private bugReportingExercise: Exercise = null;

    constructor(config: PoolConfig) {
        this.config = config;
    }

    setMode(mode: PoolMode): void {
        const changed = this.mode != mode;
        this.mode = mode;
        if (changed) {
            this.updateExercisesHTMLElement(
                document.getElementById('exercises_div'),
            );
            updateTooltips();
        }
    }

    getMode(): PoolMode {
        return this.mode;
    }

    getConfig(): PoolConfig {
        return this.config;
    }

    openBugReportingModal(exercise: Exercise): void {
        this.bugReportingExercise = exercise;
        this.bugReportingModal = new bootstrap.Modal(
            document.getElementById('modal-bug-reporting'),
        );
        document.getElementById('modal-bug-reporting-title').innerHTML =
            exercise.title;
        (<HTMLInputElement>document.getElementById('bugreport-text')).value =
            '';
        (<HTMLInputElement>document.getElementById('bugreport-contact')).value =
            '';
        const recaptchaElement = document.getElementById('bugreport-captcha');
        //recaptchaElement.innerHTML = '';
        try {
            grecaptcha.render(recaptchaElement, {
                sitekey: '6Lca4GQfAAAAALPpkGPIrkEJjNlxNCJvtN8SXE_9',
                theme: 'light',
                callback: googleRecaptchaCallback,
            });
        } catch (e) {
            // on error: previous instance is used!
        }
        document.getElementById('bugreport-captcha-error').innerHTML = '';
        this.bugReportingModal.show();
    }

    reportBug(): void {
        let bugTypeIdx = 0;
        const bugTypeOptions = document.getElementsByName('bug-type');
        for (let i = 0; i < bugTypeOptions.length; i++) {
            if ((<HTMLInputElement>bugTypeOptions[i]).checked) {
                bugTypeIdx = i;
                break;
            }
        }
        const bugType = ['content', 'display', 'moodle', 'ilias', 'misc'][
            bugTypeIdx
        ];
        const bugDescription = (<HTMLInputElement>(
            document.getElementById('bugreport-text')
        )).value;
        const bugContactData = (<HTMLInputElement>(
            document.getElementById('bugreport-contact')
        )).value;

        /*alert(bugType);
        alert(bugDescription);
        alert(bugContactData);*/

        const message =
            Date.now() +
            '#' +
            this.bugReportingExercise.moodleID +
            '#' +
            bugType +
            '#' +
            bugDescription.replace(/#/g, 'HASHTAG') +
            '#' +
            bugContactData.replace(/#/g, 'HASHTAG') +
            '\n';

        grecaptcha.reset();

        const this_ = this;
        axios
            .post(
                'report-bug.php',
                new URLSearchParams({
                    msg: message,
                    googleRecaptcha: googleReCaptchaResponse,
                }),
            )
            .then(function (response) {
                const data = response.data;
                if (data === 'success') {
                    document.getElementById(
                        'bugreport-captcha-error',
                    ).innerHTML = '';
                    this_.bugReportingModal.hide();
                } else {
                    document.getElementById(
                        'bugreport-captcha-error',
                    ).innerHTML =
                        '<span class="text-danger">reCaptcha war nicht erfolgreich!</span>';
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    private getSelectedTags(): string[] {
        const tags: string[] = [];
        for (const tax of this.taxonomy) {
            for (const item of tax.dimensionItems) {
                if (item.selected) {
                    tags.push(item.id);
                }
            }
        }
        return tags;
    }

    private getTagCategory(tag: string): string {
        // TODO: do not do the following code manually...
        if (tag.startsWith('te_1_')) return 'te_1_';
        if (tag.startsWith('te_2_')) return 'te_2_';
        if (tag.startsWith('te_3_')) return 'te_3_';
        if (tag.startsWith('bloom_')) return 'bloom_';
        if (tag.startsWith('maier_1_')) return 'maier_1_';
        if (tag.startsWith('maier_2_')) return 'maier_2_';
        if (tag.startsWith('maier_3_')) return 'maier_3_';
        if (tag.startsWith('maier_4_')) return 'maier_4_';
        if (tag.startsWith('maier_5_')) return 'maier_5_';
        if (tag.startsWith('maier_6_')) return 'maier_6_';
        if (tag.startsWith('maier_7_')) return 'maier_7_';
        if (tag.startsWith('type_')) return 'type_';
        if (tag.startsWith('praxiserprobt_')) return 'praxiserprobt_';
        return '';
    }

    private getTagCategories(tags: string[]): Set<string> {
        const categories = new Set<string>();
        for (const tag of tags) {
            const category = this.getTagCategory(tag);
            if (category.length > 0) categories.add(category);
        }
        return categories;
    }

    getTaxonomyNames(): { [id: string]: string } {
        return this.taxonomyNames;
    }

    addToWorksheet(exercise: Exercise): void {
        if (this.worksheetExercises.includes(exercise)) return;
        this.worksheetExercises.push(exercise);
    }

    removeFromWorksheet(exercise: Exercise): void {
        const idx = this.worksheetExercises.indexOf(exercise);
        if (idx != -1) this.worksheetExercises.splice(idx, 1);
        hideTooltips();
        this.updateExercisesHTMLElement(
            document.getElementById('exercises_div'),
        );
        updateTooltips();
    }

    updateExercisesHTMLElement(parent: HTMLElement): void {
        switch (this.mode) {
            case PoolMode.SelectionMode:
                this.updateExercisesHTMLElement_selectionMode(parent);
                break;
            case PoolMode.WorksheetMode:
                this.updateExercisesHTMLElement_worksheetMode(parent);
                break;
        }
    }

    private updateExercisesHTMLElement_worksheetMode(
        parent: HTMLElement,
    ): void {
        parent.innerHTML = '';
        if (this.worksheetExercises.length == 0) {
            const p = document.createElement('p');
            p.classList.add('lead');
            p.innerHTML = 'Das Aufgabenblatt ist noch leer';
            parent.appendChild(p);
            return;
        } else {
            const div = document.createElement('div');
            parent.appendChild(div);
            div.classList.add(
                'col',
                'bg-white',
                'my-3',
                'py-2',
                'lead',
                'text-center',
            );
            const paragraph = document.createElement('p');
            paragraph.classList.add('px-5');
            div.appendChild(paragraph);
            paragraph.innerHTML =
                '<p><small><i>Achtung:</i> Es wird <i>eine</i> XML-Datei erzeugt, die neben Aufgaben vom Typ STACK auch andere Aufgabentypen enthalten kann.</small></p><p><small>In manchen Fällen kann es beim Import (insbesondere in ILIAS) zu Fehlermeldungen kommen.</small></p><p><small><i>Workaround</i>: erstellen Sie Aufgabenblätter die nur jeweils einen Aufgabentyp enthalten.</small></p>';

            const button = document.createElement('button');
            div.appendChild(button);
            button.type = 'button';
            button.classList.add('btn', 'btn-outline-dark', 'btn-sm');
            button.setAttribute('data-toggle', 'tooltip');
            button.setAttribute('data-placement', 'top');
            button.title = 'Aufgabenblatt im Format Moodle-XML herunterladen';
            button.innerHTML =
                '<span style="font-size: 24pt;">' +
                '<i class="fa-solid fa-download"></i>' +
                '</span>';
            const this_ = this;
            button.addEventListener('click', function () {
                this_.worksheetMoodleXml = '';
                if (this_.worksheetExercises.length > 0) {
                    this_.downloadWorksheet_next(0);
                }
            });
        }
        for (const exercise of this.worksheetExercises) {
            parent.appendChild(exercise.createHTMLElement(this));
        }
    }

    private downloadWorksheet_next(index: number) {
        const exercise = this.worksheetExercises[index];
        const timestamp = Math.round(new Date().getTime() / 1000);
        const path = 'data/' + exercise.moodleID + '.xml?time=' + timestamp;
        const this_ = this;
        axios
            .post(path)
            .then(function (response) {
                const data = response.data.split('\n');
                let dataEdited = '';
                // remove first two lines and last line (xml-version-encoding + quiz-element)
                for (let i = 0; i < data.length; i++) {
                    const line = data[i];
                    if (line.trim().startsWith('<?xml')) continue;
                    if (line.trim().startsWith('<quiz>')) continue;
                    if (line.trim().startsWith('</quiz>')) continue;
                    if (line.trim().length == 0) continue;
                    dataEdited += line + '\n';
                }
                // append to basket_xml; go to next
                this_.worksheetMoodleXml += dataEdited;
                if (index + 1 < this_.worksheetExercises.length)
                    this_.downloadWorksheet_next(index + 1);
                else this_.downloadWorksheet_final();
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    private downloadWorksheet_final() {
        this.worksheetMoodleXml =
            '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n' +
            this.worksheetMoodleXml +
            '</quiz>\n';
        downloadFile('my-worksheet.xml', this.worksheetMoodleXml);
    }

    private updateExercisesHTMLElement_selectionMode(
        parent: HTMLElement,
    ): void {
        this.tagCountSelected = {};
        parent.innerHTML = '';
        const selectedTags = this.getSelectedTags();
        //console.log(selectedTags);
        const selectedTagsCategories = this.getTagCategories(selectedTags);
        if (selectedTagsCategories.has('te_1_') == false) {
            const p = document.createElement('p');
            p.classList.add('lead');
            p.innerHTML =
                '<div class="text-center">Kein Themengebiet ausgewählt</div>';
            parent.appendChild(p);
            return;
        }
        //console.log(selectedTagsCategories);
        for (const exercise of this.exercises) {
            const exerciseTagsCategories = this.getTagCategories(exercise.tags);
            // skip untagged exercises
            if (exerciseTagsCategories.has('te_1_') == false) {
                continue;
            }
            if (
                selectedTagsCategories.has('te_2_') &&
                !exerciseTagsCategories.has('te_2_')
            ) {
                continue;
            }
            if (
                selectedTagsCategories.has('te_3_') &&
                !exerciseTagsCategories.has('te_3_')
            ) {
                continue;
            }
            // check matching
            let skip = false;
            for (const tag of exercise.tags) {
                const category = this.getTagCategory(tag);
                if (
                    selectedTagsCategories.has(category) &&
                    selectedTags.includes(tag) == false
                ) {
                    skip = true;
                    break;
                }
            }
            // skip, if selected tags do not match
            if (skip) continue;
            for (const tag of exercise.tags) {
                if (tag in this.tagCountSelected == false)
                    this.tagCountSelected[tag] = 1;
                else this.tagCountSelected[tag]++;
            }
            parent.appendChild(exercise.createHTMLElement(this));
        }
    }

    updateTaxonomyHTMLElement(parent: HTMLElement): void {
        // TODO: move (partly) to taxonomy.ts
        const rootElement = document.createElement('div');
        parent.innerHTML = '';
        parent.appendChild(rootElement);
        let color = '';
        for (const item of this.taxonomy) {
            if (item.type == TaxonomyItemType.Head) {
                rootElement.appendChild(document.createElement('br'));
                color = item.color;
                const button = <HTMLButtonElement>(
                    document.createElement('button')
                );
                rootElement.appendChild(button);
                button.type = 'button';
                button.classList.add(
                    'btn',
                    'btn-sm',
                    'm-1',
                    'py-0',
                    'btn-' + color,
                );
                button.addEventListener('click', function () {
                    window.open(item.url, '_blank');
                });
                button.innerHTML = item.title;
                rootElement.appendChild(document.createElement('br'));
            } else if (item.type == TaxonomyItemType.Dimension) {
                let titleSpan: HTMLSpanElement = null;
                if (item.title.length > 0) {
                    titleSpan = document.createElement('span');
                    let fontColor = '';
                    switch (color) {
                        case 'info':
                            fontColor = '#b42b83';
                            break;
                    }
                    titleSpan.style.color = fontColor;
                    titleSpan.innerHTML =
                        '&nbsp;&nbsp;<sub>' + item.title + '</sub>&nbsp;';
                    rootElement.appendChild(titleSpan);
                }
                const dimItems = item.dimensionItems;
                let numberRendered = 0;
                for (const dimItem of dimItems) {
                    if (
                        dimItem.parent != null &&
                        dimItem.parent.selected == false
                    ) {
                        continue;
                    }
                    const button = <HTMLButtonElement>(
                        document.createElement('button')
                    );
                    rootElement.appendChild(button);
                    button.type = 'button';
                    button.classList.add(
                        'btn',
                        'm-1',
                        'py-0',
                        'btn-outline-dark',
                    );
                    if (dimItem.selected == false) {
                        button.classList.add('btn-sm');
                    } else {
                        button.classList.add('bg-dark');
                        button.classList.add('text-white');
                    }
                    button.setAttribute('data-toggle', 'tooltip');
                    button.setAttribute('data-placement', 'top');
                    button.title = dimItem.description;
                    let title = dimItem.title;
                    if (title == 'unknown') title = 'nicht klassifiziert';
                    let cnt = 0;
                    if (Object.keys(this.tagCountSelected).length == 0)
                        cnt = this.tagCount[dimItem.id];
                    else cnt = this.tagCountSelected[dimItem.id];
                    if (cnt != undefined) {
                        title +=
                            ' <span class="badge rounded-pill bg-danger">' +
                            cnt +
                            '</span>';
                    }
                    button.innerHTML = dimItem.selected
                        ? '<b>' + title + '</b>'
                        : title;
                    const this_ = this;
                    button.addEventListener('click', function () {
                        dimItem.selected = !dimItem.selected;
                        if (dimItem.selected == false) {
                            dimItem.selectChildren(false);
                        } else {
                            // statistics
                            axios
                                .post(
                                    'taxonomy.php',
                                    new URLSearchParams({
                                        id: dimItem.id,
                                    }),
                                )
                                .then(function (response) {
                                    const data = response.data;
                                })
                                .catch(function (error) {
                                    console.error(error);
                                });
                        }
                        this_.updateExercisesHTMLElement(
                            document.getElementById('exercises_div'),
                        );
                        this_.updateTaxonomyHTMLElement(parent);
                        hideTooltips();
                        updateTooltips();
                        hideTooltips();
                    });
                    numberRendered++;
                }
                if (numberRendered == 0) {
                    titleSpan.style.display = 'none';
                } else rootElement.appendChild(document.createElement('br'));
            }
        }
    }

    import(): void {
        // reset
        this.exercises = [];
        this.taxonomy = [];
        this.taxonomyHierarchyRoot = new TaxonomyHierarchyItem();
        this.taxonomyHierarchyRoot.id = 'root';
        this.tagCount = {};
        const this_ = this;
        // get
        axios
            .get(this.config.metaDataPath)
            .then(function (response) {
                const data = response.data;
                // fill date
                this_.date = data['date'];
                // fill taxonomy hierarchy
                this_.fillTaxonomyHierarchyRecursively(
                    data['topic_hierarchy'],
                    this_.taxonomyHierarchyRoot,
                );
                this_.taxonomyHierarchyRoot.sort();
                // fill taxonomy
                // (a) topics
                const taxonomyItem = new TaxonomyItem();
                taxonomyItem.type = TaxonomyItemType.Head;
                taxonomyItem.title = 'Themengebiet';
                this_.taxonomy.push(taxonomyItem);
                taxonomyItem.color = 'dark';

                const topic1 = new TaxonomyItem();
                topic1.type = TaxonomyItemType.Dimension;
                this_.taxonomy.push(topic1);
                topic1.title = 'Ebene <i class="fa-solid fa-1"></i>';

                const topic2 = new TaxonomyItem();
                topic2.type = TaxonomyItemType.Dimension;
                this_.taxonomy.push(topic2);
                topic2.title = 'Ebene <i class="fa-solid fa-2"></i>';

                const topic3 = new TaxonomyItem();
                topic3.type = TaxonomyItemType.Dimension;
                this_.taxonomy.push(topic3);
                topic3.title = 'Ebene <i class="fa-solid fa-3"></i>';

                for (const child of this_.taxonomyHierarchyRoot.children) {
                    const item1 = new TaxonomyDimensionItem();
                    item1.id = child.id;
                    item1.title = child.title;
                    topic1.dimensionItems.push(item1);
                    for (const child2 of child.children) {
                        const item2 = new TaxonomyDimensionItem();
                        item2.id = child2.id;
                        item2.title = child2.title;
                        item2.parent = item1;
                        item1.children.push(item2);
                        topic2.dimensionItems.push(item2);
                        for (const child3 of child2.children) {
                            const item3 = new TaxonomyDimensionItem();
                            item3.id = child3.id;
                            item3.title = child3.title;
                            item3.parent = item2;
                            item2.children.push(item3);
                            topic3.dimensionItems.push(item3);
                        }
                    }
                }

                // (b) from meta-data
                for (const t of data['taxonomy']) {
                    const taxonomyItem = new TaxonomyItem();
                    this_.taxonomy.push(taxonomyItem);
                    const tokens = t.split(':');
                    taxonomyItem.title = tokens[1];
                    if (tokens[0] === 'head') {
                        taxonomyItem.type = TaxonomyItemType.Head;
                        taxonomyItem.color = tokens[2];
                        taxonomyItem.url = data['taxonomy_urls'][tokens[3]];
                    } else if (tokens[0] === 'dim') {
                        taxonomyItem.type = TaxonomyItemType.Dimension;
                        taxonomyItem.id = tokens[2];
                        const elements = tokens[3].split(',');
                        for (let i = 0; i < elements.length; i++) {
                            const item = new TaxonomyDimensionItem();
                            taxonomyItem.dimensionItems.push(item);
                            item.id = taxonomyItem.id + '_' + (i + 1);
                            item.title = elements[i];
                            item.description = data['taxonomy_desc'][item.id];
                            this_.taxonomyNames[item.id] =
                                (taxonomyItem.title.length > 0
                                    ? taxonomyItem.title + ': '
                                    : '') + item.title;
                        }
                    }
                }
                // fill tag count
                for (const tagname in data['tag_count']) {
                    this_.tagCount[tagname] = data['tag_count'][tagname];
                }
                // fill exercises
                for (const e of data['exercises']) {
                    const exercise = new Exercise();
                    this_.exercises.push(exercise);
                    exercise.moodleID = e['id'];
                    exercise.moodleCategory = e['category'];
                    exercise.title = e['title'];
                    exercise.tags = e['tags'].sort();
                    exercise.type = e['type'];
                }
                /*console.log(this_.date);
                console.log(this_.tagCount);
                console.log(this_.taxonomy);
                console.log(this_.taxonomyHierarchyRoot);
                console.log(this_.exercises);*/

                document.getElementById('pool-date').innerHTML = this_.date;
                this_.updateTaxonomyHTMLElement(
                    document.getElementById('taglist_div'),
                );
                this_.updateExercisesHTMLElement(
                    document.getElementById('exercises_div'),
                );
                updateTooltips();
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    private fillTaxonomyHierarchyRecursively(
        data: any,
        item: TaxonomyHierarchyItem,
    ) {
        for (const tagname in data) {
            const subItem = new TaxonomyHierarchyItem();
            subItem.id = tagname;
            subItem.title = formatTagAsTitle(tagname.substring(5));
            item.children.push(subItem);
            this.fillTaxonomyHierarchyRecursively(data[tagname], subItem);
        }
    }
}
