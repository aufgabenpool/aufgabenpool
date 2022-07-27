/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

export enum TaxonomyItemType {
    Head = 'head',
    Dimension = 'dimension',
}

export class TaxonomyDimensionItem {
    id = '';
    title = '';
    description = '';
    selected = false;
    parent: TaxonomyDimensionItem = null;
    children: TaxonomyDimensionItem[] = [];
    selectChildren(value: boolean) {
        for (const child of this.children) {
            child.selected = value;
            child.selectChildren(value);
        }
    }
}

export class TaxonomyItem {
    type: TaxonomyItemType;
    id = '';
    title = '';
    color = '';
    url = '';
    dimensionItems: TaxonomyDimensionItem[] = [];
}

export class TaxonomyHierarchyItem {
    id = '';
    title = '';
    children: TaxonomyHierarchyItem[] = [];

    sort(): void {
        const order = [
            'te_1_grundlagen',
            'te_1_grenzwerte',
            'te_1_differentialrechnung',
            'te_1_integralrechnung',
            'te_1_statistik',
            'te_1_wahrscheinlichkeitsrechnung',
            'te_1_finanzmathematik',
            'te_1_lineare algebra',
        ];
        const processed: boolean[] = [];
        for (let i = 0; i < this.children.length; i++) {
            processed.push(false);
        }
        // TODO: automate the following:
        const childrenNew: TaxonomyHierarchyItem[] = [];
        for (const o of order) {
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                if (child.id.toLowerCase() === o) {
                    childrenNew.push(child);
                    processed[i] = true;
                    break;
                }
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            if (processed[i] == false) {
                console.log('!!!!' + this.children[i].id);
                childrenNew.push(this.children[i]);
            }
        }
        this.children = childrenNew;
    }
}
