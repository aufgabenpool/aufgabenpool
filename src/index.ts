/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import axios from 'axios';

const metaDataPath = 'data/meta.json';
const moodleEditPath =
    'https://aufgabenpool.f07-its.fh-koeln.de/' +
    'moodle/question/question.php?&courseid=2&id=';

export function init() {
    const pool = new Pool();
    pool.import();
}

enum TaxonomyItemType {
    Head,
    Dimension,
}

class TaxonomyHead {
    color = '';
    url = '';
}

class TaxonomyDimension {
    titles: string[] = [];
    descriptions: string[] = [];
}

class TaxonomyItem {
    type: TaxonomyItemType;
    id = '';
    title = '';
    data: TaxonomyDimension | TaxonomyHead = null;
}

class TaxonomyHierarchyItem {
    id = '';
    title = '';
    children: TaxonomyHierarchyItem[] = [];
}

class Exercise {
    moodleID = 0;
    moodleCategory = '';
    title = '';
    tags: string[] = [];
    type = '';

    createHTMLElement(): HTMLElement {
        const element = document.createElement('div');
        // TODO;
        return element;
    }
}

class Pool {
    private exercises: Exercise[] = [];
    private taxonomy: TaxonomyItem[] = [];
    private taxonomyHierarchyRoot: TaxonomyHierarchyItem = null;
    private tagCount: { [tagname: string]: number } = {};
    private date = '';

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
            .get(metaDataPath)
            .then(function (response) {
                const data = response.data;
                // fill date
                this_.date = data['date'];
                // fill taxonomy
                for (const t of data['taxonomy']) {
                    const taxonomyItem = new TaxonomyItem();
                    this_.taxonomy.push(taxonomyItem);
                    const tokens = t.split(':');
                    taxonomyItem.title = tokens[1];
                    if (tokens[0] === 'head') {
                        taxonomyItem.type = TaxonomyItemType.Head;
                        taxonomyItem.data = new TaxonomyHead();
                        taxonomyItem.data.color = tokens[2];
                        taxonomyItem.data.url =
                            data['taxonomy_urls'][tokens[3]];
                    } else if (tokens[0] === 'dim') {
                        taxonomyItem.type = TaxonomyItemType.Dimension;
                        taxonomyItem.id = tokens[2];
                        taxonomyItem.data = new TaxonomyDimension();
                        for (let i = 3, k = 1; i < tokens.length; i++, k++) {
                            taxonomyItem.data.titles.push(tokens[i]);
                            const desc =
                                data['taxonomy_desc'][
                                    taxonomyItem.id + '_' + k
                                ];
                            taxonomyItem.data.descriptions.push(desc);
                        }
                    }
                }
                // fill taxonomy hierarchy
                this_.fillTaxonomyHierarchyRecursively(
                    data['topic_hierarchy'],
                    this_.taxonomyHierarchyRoot,
                );
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
                    exercise.tags = e['tags'];
                    exercise.type = e['type'];
                }
                console.log(this_.date);
                console.log(this_.tagCount);
                console.log(this_.taxonomy);
                console.log(this_.taxonomyHierarchyRoot);
                console.log(this_.exercises);
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
            subItem.title = this.formatTagAsTitle(tagname.substring(5));
            item.children.push(subItem);
            this.fillTaxonomyHierarchyRecursively(data[tagname], subItem);
        }
    }

    private formatTagAsTitle(src: string): string {
        // examples:
        //  "Bestimmtes integral" -> "Bestimmtes Integral"
        //  "FestverzinslicheWertpapiere" -> "Festverzinsliche Wertpapiere"

        // TODO: "Definition des integrals" -> "Definition des Integrals"
        let result = '';
        const n = src.length;
        for (let i = 0; i < n; i++) {
            const ch = src[i];
            const chPrev = i == 0 ? '' : src[i - 1];
            if (chPrev == ' ' || chPrev == '-' || chPrev == '/') {
                result += ch.toUpperCase();
            } else if (this.isLowercase(chPrev) && this.isUppercase(ch)) {
                result += ' ' + ch;
            } else {
                result += ch;
            }
        }
        return result;
    }

    private isLowercase(ch: string): boolean {
        if (ch.length < 1) return false;
        return ch[0] >= 'a' && ch[0] <= 'z';
    }

    private isUppercase(ch: string): boolean {
        if (ch.length < 1) return false;
        return ch[0] >= 'A' && ch[0] <= 'Z';
    }
}
