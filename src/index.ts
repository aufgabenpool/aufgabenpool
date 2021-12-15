/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import $ from 'jquery';
import * as templates from './templates.js';

const MOODLE_EDIT_QUESTION_PATH = "https://aufgabenpool.f07-its.fh-koeln.de/moodle/question/question.php?&courseid=2&id=";

$( document ).ready(function() {
    getMetaData();
});

var basket : Array<number> = []; // local ID (not moodle id!)
var basket_xml = "";

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


var pool_button = document.getElementById("pool-button");
var basket_button = document.getElementById("basket-button");
var taglist_div = document.getElementById("taglist_div");
var exercises_div = document.getElementById("exercises_div");
var basket_div = document.getElementById("basket_div");

function update_tooltips() {
    $(function () {
        (<any>$('[data-toggle="tooltip"]')).tooltip({
            trigger: 'hover'
        });
    });
}

export function clicked_on_pool_tab() {
    pool_button.className = "btn btn-danger active";
    basket_button.className = "btn btn-outline-danger";
    taglist_div.style.display = "block";
    exercises_div.style.display = "block";
    basket_div.style.display = "none";
}

export function clicked_on_basket_tab() {
    pool_button.className = "btn btn-outline-danger";
    basket_button.className = "btn btn-danger active";
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
    let html = '<button id="tax_element_' + id + '" type="button" class="btn btn-outline-secondary btn-sm py-0 my-1" onclick="aufgabenpool.clicked_tax_element(\'' + id + '\');"' + desc_props + '>' 
        + capitalize_each_word(text) + html_cnt + '</button> ';
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

function capitalize_each_word(s : string) : string {
    let t = "";
    let next_uppercase = true;
    for(let i=0; i<s.length; i++) {
        if(s[i] == ' ' || s[i] == '-' || s[i] == '/') {
            next_uppercase = true;
            t += s[i];
            continue;
        }
        if(next_uppercase)
            t += s[i].toUpperCase();
        else
            t += s[i];
        next_uppercase = false;
    }
    return t;
}

function build_exercise(idx : number, exercise : any, isBasket=false) {
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
        optional_buttons += templates.add_exercise_to_basket_template;
    exercise_html = exercise_html.replaceAll('!OPTIONAL_BUTTONS!', optional_buttons);
    exercise_html = exercise_html.replaceAll('!TITLE!', title.toUpperCase());
    exercise_html = exercise_html.replaceAll('!EXERCISE_ID!', ""+idx);
    exercise_html = exercise_html.replaceAll('!EXERCISE_MOODLE_ID!', exercise["id"]);
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
                + capitalize_each_word(tag.substr(5)) + '</span>&nbsp;';
    }
    // te_2
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        if(tag.startsWith("te_2_"))
            exercise_topic_html += '&raquo; <span class="">' 
                + capitalize_each_word(tag.substr(5)) + '</span>&nbsp;';
    }
    // te_3
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        if(tag.startsWith("te_3_"))
            exercise_topic_html += '&raquo; <span class="">' 
                + capitalize_each_word(tag.substr(5)) + '</span>&nbsp;';
    }
    exercise_html = exercise_html.replaceAll('!TOPIC!', exercise_topic_html);

    let exercise_tags_html = '';
    // type
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        let tag_name = taxonomy_tag_names[tag];
        if(tag.startsWith("type_"))
            exercise_tags_html += '<span class="badge rounded-pill bg-dark">' 
                + tag_name + '</span>&nbsp;';
    }
    // bloom
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        let tag_name = taxonomy_tag_names[tag];
        if(tag.startsWith("bloom_"))
            exercise_tags_html += '<span class="badge rounded-pill" style="background-color:#e85b22;">' 
                + tag_name + '</span>&nbsp;';
    }
    // maier
    for(let j=0; j<exercise_tags_sorted.length; j++) {
        let tag = exercise_tags_sorted[j];
        let tag_name = taxonomy_tag_dim_names[tag] + ": " + taxonomy_tag_names[tag];
        if(tag.startsWith("maier_"))
            exercise_tags_html += '<span class="badge rounded-pill" style="background-color:#b42b83;">' 
                + tag_name + '</span>&nbsp;';
    }
    // TODO: praxiserprobt!
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
        let exercise_html = build_exercise(i, exercise, false);
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
        
        // TODO: do the following based on metadata to get ALL new dimensions immediately...
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

        // TODO: praxiserprobt
    
        if(display_exercise)
            exercises_html += exercise_html + '<br/>';
    }
    let exercises_element = document.getElementById('exercises_div');
    exercises_element.innerHTML = exercises_html;
    update_tooltips();
}

function build_basket_tree() {
    let exercises_html = '';
    if(basket.length == 0) {
        exercises_html += '<b>Das Aufgabenblatt ist noch leer</b>';
    } else {
        exercises_html += '<p class="p-0"><button type="button" class="btn btn-outline-danger btn-lg" onclick="aufgabenpool.download_basket();" data-toggle="tooltip" data-placement="top" title="Aufgabenblatt im Format Moodle-XML herunterladen"><i class="fa fa-download" aria-hidden="true"></i></button></p>';
    }
    for(let i=0; i<basket.length; i++) {
        let exercise = metadata_exercises[basket[i]];
        let exercise_html = build_exercise(basket[i], exercise, true);
        exercises_html += exercise_html + '<br/>';
    }
    let exercises_element = document.getElementById('basket_div');
    exercises_element.innerHTML = exercises_html;
    update_tooltips();
}

function getMetaData() {
    let timestamp = Math.round((new Date()).getTime() / 1000);
    let metadata_path = 'data/meta.json' + '?time=' + timestamp; // TODO!!!! test path set!!!!!
    $.ajax({
        url: metadata_path,
        type: 'GET',
        success: function(data ,status, xhr) {
            metadata = xhr.responseText;
            metadata = JSON.parse(metadata);
            let ex = metadata["exercises"];
            ex.sort(function(a : any, b : any) {
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

export function add_exercise_to_basket(idx : number) {
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
}

export function edit_exercise(idx: number) {
    let moodle_id = metadata_exercises[idx]["id"];
    let link = MOODLE_EDIT_QUESTION_PATH + moodle_id;
    window.open(link);
}

export function download_exercise(idx : number) {
    let moodle_id = metadata_exercises[idx]["id"];
    let timestamp = Math.round((new Date()).getTime() / 1000);
    let exercise_path = 'data/' + moodle_id + '.xml?time=' + timestamp;
    $.ajax({
        url: exercise_path,
        type: 'GET',
        success: function(data,status,xhr) {
            let exercise_xml = xhr.responseText;
            var filename = "pool_download_" + moodle_id + ".xml";
            download_file(filename, exercise_xml);
        },
        error: function(xhr, status, error) {
            alert("ERROR: " + xhr.responseText);
        }
    });
}

export function download_basket() {
    basket_xml = "";
    if(basket.length > 0)
        download_basket_next(0);
}

function download_basket_next(basket_idx : number) {
    let moodle_id = metadata_exercises[basket[basket_idx]]["id"];
    let timestamp = Math.round((new Date()).getTime() / 1000);
    let exercise_path = 'data/' + moodle_id + '.xml?time=' + timestamp;
    $.ajax({
        url: exercise_path,
        type: 'GET',
        success: function(data,status,xhr) {
            let exercise_xml_lines = xhr.responseText.split("\n");
            let exercise_xml_edited = "";
            // remove first two lines and last line (xml-version-encoding + quiz-element)
            for(let i=0; i<exercise_xml_lines.length; i++) {
                let line = exercise_xml_lines[i]
                if(line.trim().startsWith("<?xml"))
                    continue;
                if(line.trim().startsWith("<quiz>"))
                    continue;
                if(line.trim().startsWith("</quiz>"))
                    continue;
                if(line.trim().length == 0)
                    continue;
                exercise_xml_edited += line + "\n";
            }
            // append to basket_xml; go to next
            basket_xml += exercise_xml_edited;
            basket_idx ++;
            if(basket_idx < basket.length)
                download_basket_next(basket_idx);
            else
                download_basket_final();
        },
        error: function(xhr, status, error) {
            alert("ERROR: " + xhr.responseText);
        }
    });
}

function download_basket_final() {
    basket_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n' 
        + basket_xml 
        + '</quiz>\n';
    //console.log(basket_xml);
    download_file("pool_download_basket.xml", basket_xml);
}

function download_file(filename:string, data:string) {
    // the following code is partly taken from https://stackoverflow.com/questions/5143504/how-to-create-and-download-an-xml-file-on-the-fly-using-javascript/16751704
    var pom = document.createElement('a');
    var bb = new Blob([data], {type: 'text/plain'});
    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true; 
    pom.classList.add('dragout');
    pom.click();
}
