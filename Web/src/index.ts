/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import $ from 'jquery';
import * as templates from './templates.js';

var basket : Array<number> = [];

class TagButton {
    selected = false;
    category = "";
    name = "";
    color = ""; // (bootstrap 5.0 color, e.g. "primary")
    constructor() {
    }
}

var taxonomy_tag_names : {[key:string]:string} = {};  // e.g. "maier_2_3" -> "weiter Transfer"
var taxonomy_tag_dim_names : {[key:string]:string} = {};  // e.g. "maier_2_3" -> "Kognitiver Prozess"

var tag_button_data : Array<TagButton> = [];

var metadata = null;
var metadata_exercises = null;


var pool_element = document.getElementById("pool-tab");
var basket_element = document.getElementById("basket-tab");
var taglist_div = document.getElementById("taglist_div");
var exercises_div = document.getElementById("exercises_div");
var basket_div = document.getElementById("basket_div");

export function clicked_on_pool_tab() {
    pool_element.className = "nav-link active";
    basket_element.className = "nav-link";
    taglist_div.style.display = "block";
    exercises_div.style.display = "block";
    basket_div.style.display = "none";
}

export function clicked_on_basket_tab() {
    pool_element.className = "nav-link";
    basket_element.className = "nav-link active";
    taglist_div.style.display = "none";
    exercises_div.style.display = "none";
    build_basket_tree();
    basket_div.style.display = "block";
}

function create_tax_head(id:string, color='dark', link='') {
    return '<br/><button id="tax_head_' + id + '" type="button" class="btn btn-' + color + ' btn-sm m-1 py-0" onclick="window.open(\'' + link + '\', \'_blank\');">' + id + '</button>';
}

var category_texts = {};

function create_tax_desc(category:string, id:string, description='') {
    let desc_props = "";
    if(description.length > 0) {
        desc_props = ` data-toggle="tooltip" data-placement="top" title="` + description + `" `;
    }
    category_texts[category] = id;
    let color = 'secondary';
    return '<button id="tax_desc_' + id + '" type="button" class="btn btn-' + color + ' btn-sm m-1 py-0" onclick=""' + desc_props + '>' + id + '</button>';
}

var tax_texts = {};
var tax_cnt = {};
var tax_selected : {[id:string]:boolean} = {};

function create_tax_element(id : string, text : string, description='') {
    let cnt = id in metadata["tag_count"] ? metadata["tag_count"][id] : 0;
    let desc_props = "";
    if(description.length > 0)
        desc_props = ` data-toggle="tooltip" data-placement="top" title="` + description + `" `;
    tax_texts[id] = text;
    tax_cnt[id] = cnt;
    if(!(id in tax_selected))
        tax_selected[id] = false;
    let html_cnt = cnt==0 ? '' : ' <span class="badge rounded-pill bg-danger">' + cnt + '</span>';
    let html = '<button id="tax_element_' + id + '" type="button" class="btn btn-outline-secondary btn-sm py-0 my-1" onclick="aufgabenpool.clicked_tax_element(\'' + id + '\');"' + desc_props + '>' + text + html_cnt + '</button> ';
    return html;
}

function mark_tag_element(id: string) {
    let element = document.getElementById("tax_element_" + id);
    let text = tax_texts[id];
    element.classList.remove("py-0");
    element.classList.add("py-1");
    element.classList.remove("btn-outline-secondary");
    element.classList.add("btn-outline-dark");
    if(tax_cnt[id] > 0)
        element.innerHTML = "<b>" + text.toUpperCase() + ' <span class="badge rounded-pill bg-danger">' + tax_cnt[id] + '</span></button>' + "</b>";
    else
        element.innerHTML = "<b>" + text.toUpperCase() + "</b>";
}

function unmark_tag_element(id: string) {
    let element = document.getElementById("tax_element_" + id);
    let text = tax_texts[id];
    element.classList.add("py-0");
    element.classList.remove("py-1");
    element.classList.add("btn-outline-secondary");
    element.classList.remove("btn-outline-dark");
    if(tax_cnt[id] > 0)
        element.innerHTML = text + ' <span class="badge rounded-pill bg-danger">' + tax_cnt[id] + '</span></button>';
    else
        element.innerHTML = text;
}

export function clicked_tax_element(id : string) {
    console.log("clicked on " + id); // TODO: remove this line
    let text = tax_texts[id];
    if(tax_selected[id] == false) {
        tax_selected[id] = true;
        mark_tag_element(id);
    } else {
        tax_selected[id] = false;
        unmark_tag_element(id);
    }
    // rebuild topic hierarchy
    build_topic_hierarchy();
    // exercises
    build_exercises_tree();
}

function build_document() {
    metadata_exercises = metadata["exercises"];
    document.getElementById("pool-date").innerHTML = metadata["date"];
    let tags_html = '';
    tags_html += create_tax_head('Themengebiet');
    /*tags_html += '<br/>' + create_tax_desc('TE_1', 'I');
    for(let topic_id in metadata["topic_hierarchy"]) {
        let tokens = topic_id.split("_");
        let topic = tokens[tokens.length-1];
        tags_html += create_tax_element(topic_id, topic);
    }*/
    tags_html += '<div class="p-0 m-0" id="TE"></div>'

    // build taxonomy buttons from metadata
    for(let i=0; i<metadata["taxonomy"].length; i++) {
        let command = metadata["taxonomy"][i];
        let tokens = command.split(":");
        if(tokens[0] === "head") {
            let name = tokens[1];
            let color = tokens[2];
            let url = tokens[3] in metadata["taxonomy_urls"] ? metadata["taxonomy_urls"][tokens[3]] : "";
            tags_html += i==0 ? "" : '<br/>';
            tags_html += create_tax_head(name, color, url);
        } else if(tokens[0] === "dim") {
            let id = tokens[2];
            let name = tokens[1];
            if(name.length > 0)
                tags_html += '<br/>' + create_tax_desc(id, name);
            else
                tags_html += '<br/>&nbsp;';
            let names = tokens[3].split(",");
            for(let k=0; k<names.length; k++) {
                let id_k = id + '_' + (k+1);
                let desc = "";
                if(id_k in metadata["taxonomy_desc"])
                    desc = metadata["taxonomy_desc"][id_k];
                taxonomy_tag_names[id_k] = names[k];
                taxonomy_tag_dim_names[id_k] = name;
                tags_html += create_tax_element(id_k, names[k], desc);
            }
        }
    }

    tags_html += '<br/>';
    tags_html += '<br/>';

    let tags_element = document.getElementById('taglist_div');
    tags_element.innerHTML = tags_html;
    // topic hierarchy
    build_topic_hierarchy();
    // exercises
    build_exercises_tree();
}

function build_topic_hierarchy() {
    // get all selected topics of level 1
    let selected_te1 : Array<string> = [];
    for(let tax_id in tax_selected) {
        if(tax_id.startsWith("te_1_") && tax_selected[tax_id] == true)
            selected_te1.push(tax_id);
    }
    // get all selected topics of level 2
    let selected_te2 : Array<string> = [];
    for(let tax_id in tax_selected) {
        if(tax_id.startsWith("te_2_") && tax_selected[tax_id] == true)
            selected_te2.push(tax_id);
    }
    // create HTML elements
    let tediv = document.getElementById("TE");
    tediv.innerHTML = "";
    // - first level
    tediv.innerHTML += create_tax_desc('TE_1', 'I');
    for(let te1_i in metadata["topic_hierarchy"]) {
        let tokens = te1_i.split("_");
        let topic = tokens[tokens.length-1];
        tediv.innerHTML += create_tax_element(te1_i, topic);
        if(tax_selected[te1_i])
            mark_tag_element(te1_i);
    }
    tediv.innerHTML += '<br/>';
    // - second level
    if(selected_te1.length > 0) {
        tediv.innerHTML += create_tax_desc('TE_2', 'II');
        for(let te1_i in metadata["topic_hierarchy"]) {
            if(selected_te1.includes(te1_i)) {
                for(let te2_j in metadata["topic_hierarchy"][te1_i]) {
                    let tokens = te2_j.split("_");
                    let topic = tokens[tokens.length-1];
                    tediv.innerHTML += create_tax_element(te2_j, topic);
                    if(tax_selected[te2_j])
                        mark_tag_element(te2_j);
                }
            }
        }
    }
    // - third level
    if(selected_te2.length > 0) {
        tediv.innerHTML += '<br/>' + create_tax_desc('TE_3', 'III');
        for(let te1_i in metadata["topic_hierarchy"]) {
            if(selected_te1.includes(te1_i)) {
                for(let te2_j in metadata["topic_hierarchy"][te1_i]) {
                    if(selected_te2.includes(te2_j)) {
                        for(let te3_k in metadata["topic_hierarchy"][te1_i][te2_j]) {
                            let tokens = te3_k.split("_");
                            let topic = tokens[tokens.length-1];
                            tediv.innerHTML += create_tax_element(te3_k, topic);
                            if(tax_selected[te3_k])
                                mark_tag_element(te3_k);
                        }
                    }
                }
            }
        }
    }
}

function build_exercise(exercise, isBasket=false) {
    let exercise_html = templates.exercise_template;
    if(isBasket)
        exercise_html = exercise_html.replaceAll("carousel_", "carouselbasket_");
    let title = exercise["title"];
    if(title.startsWith('0'))  // TODO: remove this as soon as numbers are removed from Moodle
        title = title.substr(5);
    let optional_buttons = '';
    if(isBasket)
        optional_buttons += templates.remove_exercise_template;
    else
        optional_buttons += templates.select_exercise_template;
    exercise_html = exercise_html.replaceAll('!OPTIONAL_BUTTONS!', optional_buttons);
    exercise_html = exercise_html.replaceAll('!TITLE!', title.toUpperCase());
    exercise_html = exercise_html.replaceAll('!EXERCISE_ID!', exercise["id"]);
    let exercise_type = exercise["type"];
    if(exercise_type === 'stack')
        exercise_type = 'STACK';
    else if(exercise_type === 'multichoice')
        exercise_type = 'MULTIPLE CHOICE';
    else if(exercise_type === 'truefalse')
        exercise_type = 'WAHR/FALSCH';
    exercise_html = exercise_html.replaceAll('!EXERCISE_TYPE!', exercise_type);
    let exercise_tags = exercise['tags'];
    let exercise_tags_sorted = exercise_tags.sort();
    let exercise_topic_html = '';
    // te_1
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        if(tag.startsWith("te_1_"))
            exercise_topic_html += '<span class="">'
                + tag.substr(5) + '</span>&nbsp;';
    }
    // te_2
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        if(tag.startsWith("te_2_"))
        exercise_topic_html += '&raquo; <span class="">' 
                + tag.substr(5) + '</span>&nbsp;';
    }
    // te_3
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        if(tag.startsWith("te_3_"))
        exercise_topic_html += '&raquo; <span class="">' 
                + tag.substr(5) + '</span>&nbsp;';
    }
    exercise_html = exercise_html.replaceAll('!TOPIC!', exercise_topic_html);

    let exercise_tags_html = '';
    // bloom
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        let tag_name = taxonomy_tag_names[tag];
        if(tag.startsWith("bloom_"))
            exercise_tags_html += '<span class="badge rounded-pill bg-success">' 
                + tag_name + '</span>&nbsp;';
    }
    // maier
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        let tag_name = taxonomy_tag_dim_names[tag] + ": " + taxonomy_tag_names[tag];
        if(tag.startsWith("maier_"))
            exercise_tags_html += '<span class="badge rounded-pill bg-primary">' 
                + tag_name + '</span>&nbsp;';
    }
    exercise_html = exercise_html.replaceAll('!TAGS!', exercise_tags_html);
    return exercise_html;
}

function get_tagdim_selection(dim_prefix="") : Array<string> {
    let selected : Array<string> = [];
    for(let tax_id in tax_selected) {
        if(tax_id.startsWith(dim_prefix) && tax_selected[tax_id] == true)
            selected.push(tax_id);
    }
    return selected
}

function arr_contains(u : Array<string>, v : Array<string>) : boolean {
    for(let ui of u) {
        if(v.includes(ui))
            return true;
    }
    return false;
}

function build_exercises_tree() {
    let exercises_html = '';
    for(let i=0; i<metadata_exercises.length; i++) {
        let display_exercise = true;
        let exercise = metadata_exercises[i];
        let exercise_html = build_exercise(exercise, false);
        let exercise_tags : Array<string> = exercise['tags'];
        // filter te_1_
        let selected_te1 = get_tagdim_selection("te_1_");
        if(selected_te1.length == 0)
            continue;    
        if(arr_contains(selected_te1, exercise_tags) == false)
            continue;
        // filter te_2_
        let selected_te2 = get_tagdim_selection("te_2_");
        if(selected_te2.length > 0 && arr_contains(selected_te2, exercise_tags) == false)
            continue;
        // filter te_3_
        let selected_te3 = get_tagdim_selection("te_3_");
        if(selected_te3.length > 0 && arr_contains(selected_te3, exercise_tags) == false)
            continue;
        
        // TODO: do the following based on metadata to get ALL new dimensiona immediately...
        let selected_bloom = get_tagdim_selection("bloom_");
        if(selected_bloom.length > 0 && arr_contains(selected_bloom, exercise_tags) == false)
            continue;
        let selected_maier_1 = get_tagdim_selection("maier_1_");
        if(selected_maier_1.length > 0 && arr_contains(selected_maier_1, exercise_tags) == false)
            continue;
        let selected_maier_2 = get_tagdim_selection("maier_2_");
        if(selected_maier_2.length > 0 && arr_contains(selected_maier_2, exercise_tags) == false)
            continue;
        let selected_maier_3 = get_tagdim_selection("maier_3_");
        if(selected_maier_3.length > 0 && arr_contains(selected_maier_3, exercise_tags) == false)
            continue;
        let selected_maier_4 = get_tagdim_selection("maier_4_");
        if(selected_maier_4.length > 0 && arr_contains(selected_maier_4, exercise_tags) == false)
            continue;
        let selected_maier_5 = get_tagdim_selection("maier_5_");
        if(selected_maier_5.length > 0 && arr_contains(selected_maier_5, exercise_tags) == false)
            continue;
        let selected_maier_6 = get_tagdim_selection("maier_6_");
        if(selected_maier_6.length > 0 && arr_contains(selected_maier_6, exercise_tags) == false)
            continue;
        let selected_maier_7 = get_tagdim_selection("maier_7_");
        if(selected_maier_7.length > 0 && arr_contains(selected_maier_7, exercise_tags) == false)
            continue;
        let selected_type = get_tagdim_selection("type_");
        if(selected_type.length > 0 && arr_contains(selected_type, exercise_tags) == false)
            continue;
    
        /*for(let t in tax_selected) {
            if(tax_selected[t]) {
                if(t.startsWith("type_"))  // exercise type is handled below
                    continue;
                let tmp = t.replaceAll('_', ':');  // TODO: replaceAll compatible with all browsers?????
                if(exercise_tags.includes(tmp) == false) {
                    display_exercise = false;
                    break;
                }
            }
        }
        if(tax_selected['type_stack'] && exercise["type"] !== 'stack')
            display_exercise = false;
        if(tax_selected['type_truefalse'] && exercise["type"] !== 'truefalse')
            display_exercise = false;
        if(tax_selected['type_multichoice'] && exercise["type"] !== 'multichoice')
            display_exercise = false;*/
        if(display_exercise)
            exercises_html += exercise_html + '<br/>';
    }
    let exercises_element = document.getElementById('exercises_div');
    exercises_element.innerHTML = exercises_html;
    // activate button tooltips
    $(function () {
        (<any>$('[data-toggle="tooltip"]')).tooltip({
            trigger: 'hover'
        });
    });
}

function build_basket_tree() {
    let exercises_html = '';
    if(basket.length == 0) {
        exercises_html += '<b>Das Aufgabenblatt ist noch leer</b>';
    } else {
        exercises_html += '<p class="p-1"><button type="button" class="btn btn-outline-primary btn-sm" onclick="download_selected_exercises();">Aufgabenblatt im Format Moodle-XML herunterladen</button></p>';
    }
    for(let i=0; i<basket.length; i++) {
        let exercise = null; //metadata_exercises[basket[i]];
        // TODO: the following is slow...
        for(let j=0; j<metadata_exercises.length; j++) {
            if(metadata_exercises[j]["id"] == basket[i]) {
                exercise = metadata_exercises[j];
                break;
            }
        }
        if(exercise == null) // this should NEVER happen...
            continue;
        let exercise_html = build_exercise(exercise, true);
        let exercise_tags = exercise['tags'];
        exercises_html += exercise_html + '<br/>';
    }
    let exercises_element = document.getElementById('basket_div');
    exercises_element.innerHTML = exercises_html;
    // activate button tooltips
    $(function () {
        (<any>$('[data-toggle="tooltip"]')).tooltip({
            trigger: 'hover'
        });
    });
}

$( document ).ready(function() {
    getMetaData();
});

function getMetaData() {
    let timestamp = Math.round((new Date()).getTime() / 1000);
    let metadata_path = 'Data/meta.json' + '?time=' + timestamp; // TODO!!!! test path set!!!!!
    $.ajax({
        url: metadata_path,
        type: 'GET',
        success: function(data,status,xhr) {
            metadata = xhr.responseText;
            metadata = JSON.parse(metadata);
            let ex = metadata["exercises"];
            ex.sort(function(a,b) {
                return a.title > b.title;
            });
            metadata["exercises"] = ex;
            build_document();
            
        },
        error: function(xhr, status, error) {
            alert("ERROR: " + xhr.responseText);
        }
    });
}

export function toggleTag(tag_idx : number) {
    let buttonData = tag_button_data[tag_idx]
    let tagElement = document.getElementById("button_tag_" + tag_idx);
    buttonData.selected = !buttonData.selected;
    if(buttonData.selected)
        tagElement.setAttribute("class", "btn btn-" + buttonData.color + " btn-sm m-1");
    else
        tagElement.setAttribute("class", "btn btn-outline-" + buttonData.color + " btn-sm m-1");
    build_exercises_tree();
}

export function select_exercise(idx : number) {
    // only push to basket, if not already done
    for(let i=0; i<basket.length; i++) {
        if(basket[i] == idx)
            return;
    }
    // push
    basket.push(idx);
}

export function remove_exercise(idx : number) {
    let new_basket = [];
    for(let i=0; i<basket.length; i++) {
        if(basket[i] == idx)
            continue;
        new_basket.push(basket[i]);
    }
    basket = new_basket;
    build_basket_tree();
    // update button tooltips
    $(function () {
        (<any>$('[data-toggle="tooltip"]')).tooltip({
            trigger: 'hover'
        });
    });
}

export function download_selected_exercises(idx : number) {
    alert("... noch nicht implementiert");
}

export function edit_exercise(id: number) {
    let link = "https://sell.f07-its.fh-koeln.de/moodle/question/question.php?&courseid=2&id=" + id;
    window.open(link);
}

export function download_exercise(idx : number) {
    let timestamp = Math.round((new Date()).getTime() / 1000);
    let exercise_path = 'Data/' + idx + '.xml?time=' + timestamp;
    $.ajax({
        url: exercise_path,
        type: 'GET',
        success: function(data,status,xhr) {
            let exercise_xml = xhr.responseText;
            // the following code is partly taken from https://stackoverflow.com/questions/5143504/how-to-create-and-download-an-xml-file-on-the-fly-using-javascript/16751704
            var filename = "pool_download_" + idx + ".xml";
            var pom = document.createElement('a');
            var bb = new Blob([exercise_xml], {type: 'text/plain'});
            pom.setAttribute('href', window.URL.createObjectURL(bb));
            pom.setAttribute('download', filename);
            pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
            pom.draggable = true; 
            pom.classList.add('dragout');
            pom.click();
        },
        error: function(xhr, status, error) {
            alert("ERROR: " + xhr.responseText);
        }
    });
}
