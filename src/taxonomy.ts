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
}
