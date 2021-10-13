/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

import $ from 'jquery';

var basket : Array<number> = [];

class TagButton {
    selected = false;
    category = "";
    name = "";
    color = ""; // (bootstrap 5.0 color, e.g. "primary")
    constructor() {
    }
}

var tag_button_data : Array<TagButton> = [];
var mapping_tagname_category = {};

var metadata = null;
var taxonomyData = null;
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

    //TODO: basket_div.innerHTML = html;
}

function create_tag(category : string, tagname : string, color : string, tagpostfix='') {
    let idx = tag_button_data.length;
    let tb = new TagButton();
    tb.selected = false;
    tb.category = category;
    tb.color = color;
    tb.name = tagname;
    tag_button_data.push(tb);
    mapping_tagname_category[tagname] = category;
    return '<button id="button_tag_' + idx + '" type="button" class="btn btn-outline-' + color + ' btn-sm m-1" onclick="toggleTag(\'' + idx + '\');">'
    + tagname + tagpostfix
    /*+ ' <span class="badge rounded-pill bg-' + color + '">9</span>'*/ // TODO
    + '</button>';
}

function create_tax_head(id, color='dark', link='') {
    return '<br/><button id="tax_head_' + id + '" type="button" class="btn btn-' + color + ' btn-sm m-1 py-0" onclick="window.open(\'' + link + '\', \'_blank\');">' + id + '</button>';
}

var category_texts = {};

function create_tax_desc(category, id, description='') {

    let desc_props = "";
    if(description.length > 0) {
        desc_props = ` data-toggle="tooltip" data-placement="top" title="` + description + `" `;
    }

    category_texts[category] = id;
    let color = 'secondary';
    return '</br><button id="tax_desc_' + id + '" type="button" class="btn btn-' + color + ' btn-sm m-1 py-0" onclick=""' + desc_props + '>' + id + '</button>';
}

var tax_texts = {};
var tax_cnt = {};
var tax_selected : {[id:string]:boolean} = {};

function create_tax_element(id : string, text : string, description='') {

    let cnt = get_tag_count(id);

    let desc_props = "";
    if(description.length > 0) {
        desc_props = ` data-toggle="tooltip" data-placement="top" title="` + description + `" `;
    }

    tax_texts[id] = text;
    tax_cnt[id] = cnt;
    tax_selected[id] = false;
    let color = 'secondary';
    //return '<button id="tex_element_"' + id + ' type="button" class="btn btn-outline-secondary btn-sm py-0">' + text + ' <span class="badge rounded-pill bg-danger">' + cnt + '</span></button> ';
    if(cnt == 0)
        return '<button id="tax_element_' + id + '" type="button" class="btn btn-outline-secondary btn-sm py-0 my-1" onclick="aufgabenpool.clicked_tax_element(\'' + id + '\');"' + desc_props + '>' + text + '</button> ';
    else
        return '<button id="tax_element_' + id + '" type="button" class="btn btn-outline-secondary btn-sm py-0 my-1" onclick="aufgabenpool.clicked_tax_element(\'' + id + '\');"' + desc_props + '>' + text + ' <span class="badge rounded-pill bg-danger">' + cnt + '</span></button> ';
    //color = 'dark';
    //id = id.toUpperCase();
    //return '<button type="button" class="btn btn-outline-' + color + ' btn-sm py-1"><b>' + id + ' </b><span class="badge rounded-pill bg-danger">' + cnt + '</span></button> ';
}

export function clicked_tax_element(id : string) {
    console.log("clicked on " + id);
    let element = document.getElementById("tax_element_" + id);
    let text = tax_texts[id];
    if(tax_selected[id] == false) {
        tax_selected[id] = true;
        element.classList.remove("py-0");
        element.classList.add("py-1");
        element.classList.remove("btn-outline-secondary");
        element.classList.add("btn-outline-dark");
        //element.classList.add("bg-dark");
        if(tax_cnt[id] > 0)
            element.innerHTML = "<b>" + text.toUpperCase() + ' <span class="badge rounded-pill bg-danger">' + tax_cnt[id] + '</span></button>' + "</b>";
        else
            element.innerHTML = "<b>" + text.toUpperCase() + "</b>";
    } else {
        tax_selected[id] = false;
        element.classList.add("py-0");
        element.classList.remove("py-1");
        element.classList.add("btn-outline-secondary");
        element.classList.remove("btn-outline-dark");
        //element.classList.remove("bg-dark");
        if(tax_cnt[id] > 0)
            element.innerHTML = text + ' <span class="badge rounded-pill bg-danger">' + tax_cnt[id] + '</span></button>';
        else
            element.innerHTML = text;
    }

    // rebuild topic hierarchy
    build_topic_hierarchy();

    // exercises
    build_exercises_tree();
}

function get_tag_count(id) {
    let cnt = 0;
    let tmp = id.replaceAll('_', ':');
    for(let i=0; i<metadata_exercises.length; i++) {
        let exercise = metadata_exercises[i];
        let exercise_tags = exercise['tags'];
        if(exercise_tags.includes(tmp))
            cnt ++;
    }
    return cnt;
}

function build_document() {
    metadata_exercises = metadata["exercises"];

    document.getElementById("pool-date").innerHTML = metadata["date"];

    let tags_html = '';
    //tags_html += '<span class="text-danger">ACHTUNG: die folgenden Buttons zur Filterung sind momentan nicht funktional. Dies wird nachgeholt, sobald ein paar der Aufgaben in Moodle mit den vereinbarten Tags versehen worden sind :-)</span><br/>';

    tags_html += create_tax_head('Themengebiet');
    tags_html += create_tax_desc('TE_1', 'I');

    // TODO: get main topics from metadata...
    tags_html += create_tax_element('TE_1_ElementareFunktionen', 'Elementare Funktionen');
    tags_html += create_tax_element('TE_1_GrenzwerteUndStetigkeit', 'Grenzwerte und Stetigkeit');
    tags_html += create_tax_element('TE_1_Differentialrechnung', 'Differentialrechnung');
    tags_html += create_tax_element('TE_1_Integralrechnung', 'Integralrechnung');
    
    //tags_html += create_tax_desc('TE_2', 'II');
    tags_html += '<div id="TE_2"></div>'
    //tags_html += create_tax_element('PartielleIntegration', 'Partielle Integration', 5);

    /*for(let i=0; i<metadata["tags-all"].length; i++) {
        let tag = metadata["tags-all"][i];
        if(tag.startsWith("TE:2:")) {
            let tag_displayed = tag.split(':');
            tag_displayed = tag_displayed[tag_displayed.length-1];
            tags_html += create_tax_element(tag.replaceAll(":","_"), tag_displayed);
        }
    }*/

    tags_html += '<div id="TE_3"></div>'

    tags_html += '<br/>';

    // TODO: ERKLÄRUNGSTEXTE DIREKT AUS LITERATURQUELLEN KOPIERT -> UMSCHREIBEN!!

    tags_html += create_tax_head('Bloom', 'success', 'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=bloom+taxonomy+1956&btnG=');
    tags_html += '<br/>&nbsp;';
    tags_html += create_tax_element('Bloom_1', 'Wissen', 'Faktenwissen, Kennen');
    tags_html += create_tax_element('Bloom_2', 'Verständnis', 'Verstehen, mit eigenen Worten begründen');
    tags_html += create_tax_element('Bloom_3', 'Anwendung', 'Umsetzung eindimensionaler Lerninhalte, Beispiele aus eigener Praxis');
    tags_html += create_tax_element('Bloom_4', 'Analyse', 'Zerlegen in Einzelteile, Fallstudien');
    tags_html += create_tax_element('Bloom_5', 'Synthese', 'Vernetzen und optimieren, fachübergreifend darstellen, Projektaufgaben');
    tags_html += create_tax_element('Bloom_6', 'Beurteilung', 'Synthese + zusätzliche Bewertung durch die Lernenden');

    tags_html += '<br/>';

    tags_html += create_tax_head('Maier', 'primary', 'https://www.pedocs.de/frontdoor.php?source_opus=13874');
    tags_html += create_tax_desc('Maier_1', 'Wissensart');
    //tags_html += '<br/>&nbsp;&nbsp;Wissensart ';
    tags_html += create_tax_element('Maier_1_1', 'Fakten', 'explizit verbalisierbar, in Aussagenform gespeichert, Kenntnis isolierter aber auch komplexer Fakten, terminologisches Wissen, Regeln abfragen ohne Anwendung');
    tags_html += create_tax_element('Maier_1_2', 'Prozeduren', 'implizit und nicht verbalisierbar, Automatisierte Verhaltensweisen, Routinen, Algorithmen, Fertigkeiten bis zu komplexen Routinen und Handlungsmustern');
    tags_html += create_tax_element('Maier_1_3', 'Konzepte', 'verbalisierbar und/oder implizit, Klassifikationen, Schemata, Kategorien, Begriffsnetze, Modellierungen, Erklärungen, vielfach vernetzt zu Zusammenhängen und Begriffsnetzen');
    tags_html += create_tax_element('Maier_1_4', 'Metakognition', 'Wissen über eigenes Wissen, Steuerung von Lernhandlungen, (Monitoring), Wissen über Informationsverarbeitungsstrategien, wird direkt in der Aufgabenstellung angeregt oder gefordert');
    tags_html += create_tax_desc('Maier_2', 'Kognitiver Prozess');
    tags_html += create_tax_element('Maier_2_1', 'Reproduktion', 'Abruf von Wissen aus dem Langzeitgedächtnis, Wiedergabe von gespeicherten Wissen, Nachahmung von Prozeduren, auch metakogn. und konzept. Wissen kann reproduziert werden');
    tags_html += create_tax_element('Maier_2_2', 'naher Transfer', 'Aufgabensituation und gespeichertes Wissen unterscheiden sich nur geringfügig; eindeutig, welches Wissen (Fakten, Konzepte, etc.) zur Anwendung kommt, einfache Verfahren anwenden, kleinschrittiges Ausführen');
    tags_html += create_tax_element('Maier_2_3', 'weiter Transfer', 'Anwendungssituation/Aufgabe ist relativ neu, nicht sofort einsichtig, welches Wissen zur Anwendung kommt; Wissen ist allerdings in der Form vorhanden, in der es zur Anwendung kommt; Einige Anhaltspunkte sind vorgegeben, ohne jedoch auf einen Lösungsweg festzulegen');
    tags_html += create_tax_element('Maier_2_4', 'Problemlösen', 'unbekannte Aufgabensituation; unklar, welches Wissen zur Anwendung kommt; das zur Bearbeitung einer Situation erforderliche Wissen muss erst zusammengefügt werden; Schüler müssen auf unterschiedliche Wissensarten zurückgreifen (Fakten, Konzepte, Prozeduren, Strategiewissen); Problemlöseprozess: Problem finden bzw. definieren, Lösungen entwerfen, Lösungen umsetzen und Lösungen bewerten.');
    tags_html += create_tax_desc('Maier_3', 'Wissenseinheiten');
    tags_html += create_tax_element('Maier_3_1', 'eine', 'Nur ein Begriff, Konzept oder eine Prozedur auf höchster Ebene zu aktivieren.');
    tags_html += create_tax_element('Maier_3_2', 'bis zu 4', 'bis 4 Begriffe; Konzepte oder Prozeduren müssen auf oberster Hierarchieebene gleichzeitig aktiviert und verknüpft werden');
    tags_html += create_tax_element('Maier_3_3', 'mehr als 4', 'Eine große Zahl (mehr als 4) verschiedener Begriffe, Konzepte oder Prozeduren muss gleichzeitig aktiviert werden');
    tags_html += create_tax_desc('Maier_4', 'Offenheit');
    tags_html += create_tax_element('Maier_4_1', 'definiert / konvergent', 'Die Aufgabe umfasst einen eindeutigen Arbeitsauftrag bzw. eine klar identifizierbare Fragestellung; Eine Lösung ist gesucht bzw. richtig; dies muss allerdings nicht explizit angegeben sein');
    tags_html += create_tax_element('Maier_4_2', 'definiert / divergent', 'eindeutiger Arbeitsauftrag; bei dem mehrere Lösungen möglich sind. Die Aufgabe umfasst eine klar identifizierbare Fragestellung; mehrere Lösungen (bzw. Lösungswege) sind gesucht bzw. richtig; in der Regel werden die Schüler auf diesen Umstand hingewiesen');
    tags_html += create_tax_element('Maier_4_3', 'nicht definiert / divergent', 'Die Schüler erhalten Informationen über ein Problem, eine Situation, etc. Es sind unterschiedliche Fragestellungen denkbar; eine Problemsituation ist die einzige Handlungsaufforderung; damit sind auch mehrere Lösungen (bzw. Lösungswege) gesucht bzw. richtig');
    tags_html += create_tax_desc('Maier_5', 'Lebensweltbezug');
    tags_html += create_tax_element('Maier_5_1', 'kein', 'Keine Verknüpfung zwischen Fachwissen und Lebenswelt/Erfahrungsbereich der Schüler/innen gefordert oder vorgegeben');
    tags_html += create_tax_element('Maier_5_2', 'konstruiert', 'Verknüpfung zwischen Fachwissen und Lebenswelt stark konstruiert; entspricht eher nicht den Erfahrungen des Schülers; Analogien zur eigenen Erfahrung kaum erkennbar; Bezug wirkt „aufgesetzt“; Fachwissen soll eingekleidet werden');
    tags_html += create_tax_element('Maier_5_3', 'authentisch', 'Lebensweltbezug ist konstruiert, macht im Zusammenhang der Aufgabe aber Sinn; entspricht größtenteils den Erfahrungen der Schüler; wirkt nicht aufgesetzt; sinnvolle Anwendungen für Alltag, Berufsleben, etc');
    tags_html += create_tax_element('Maier_5_4', 'real', 'Keine Differenz zwischen Aufgabe und Lebenswelt; reale Problemstellung ist zu bearbeiten');
    tags_html += create_tax_desc('Maier_6', 'Sprachliche Komplexität');
    tags_html += create_tax_element('Maier_6_1', 'niedrig', 'wenig Text; chronologisch geordnet; einfache Syntax; kein oder kaum Text. Reihenfolge der Sätze entspricht Aufgabenbearbeitung; einfache Haupt und Nebensätze');
    tags_html += create_tax_element('Maier_6_2', 'mittel', 'Textpassagen mit teilweise für die Aufgabenbearbeitung irrelevanten Informationen; sprachlich komplexer. Reihenfolge der Sätze entspricht nicht immer der Aufgabenbearbeitung; Textpassagen mit irrelevanter Information');
    tags_html += create_tax_element('Maier_6_3', 'hoch', 'z.T. irrelevante, irritierende Formulierungen; komplexe Syntax. Aufgabe verdeckt die inneren, logischen Bezüge; logische Funktionen (Verneinungen, wenndann Verknüpfungen, Allaussagen, etc.); komplexe Satzgefüge');
    tags_html += create_tax_desc('Maier_7', 'Repräsentationsformen');
    tags_html += create_tax_element('Maier_7_1', 'eine', ' Aufgabenstellung und Aufgabenlösung basieren auf einer Repräsentationsform. Aufgabeninformation und Aufgabenlösung basieren auf Wissen in einer Repräsentationsform; eventuell noch andere Repräsentationsformen vorhanden, die für die Lösung jedoch irrelevant sind (z.B. Bild zur Illustration)');
    tags_html += create_tax_element('Maier_7_2', 'Integration', 'Aufgabe gibt Wissen in verschiedenen Repräsentationsformen vor; Integration dieser Formen für die Lösung nötig; Aufgabenlösung bewegt sich  innerhalb der vorgegebenen Repräsentationsformen');
    tags_html += create_tax_element('Maier_7_3', 'Transformation', ' Integration und Transformation des Wissens. Schüler muss für die Aufgabenlösung das vorliegende Wissen in eine Repräsentationsform transformieren, die nicht durch die Aufgabe vorgegeben wird');

    tags_html += '<br/>';

    tags_html += create_tax_head('Typ');
    tags_html += '<br/>&nbsp;';
    tags_html += create_tax_element('type_truefalse', 'Wahr/Falsch');
    tags_html += create_tax_element('type_multichoice', 'Multiple-Choice');
    tags_html += create_tax_element('type_stack', 'Stack');

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
    let te2div = document.getElementById("TE_2");


    TODO: PUT THIS INTO METADATA!!!!!

    let selected_te1 : Array<string> = [];
    for(let tax_id in tax_selected) {
        if(tax_id.startsWith("TE_1_") && tax_selected[tax_id] == true) {
            selected_te1.push(tax_id.toLowerCase().replaceAll("_",":"));
        }
    }

    console.log(selected_te1); // all selected topics of level 1

    te2div.innerHTML = "";
    if(selected_te1.length > 0) {
        te2div.innerHTML = create_tax_desc('TE_2', 'II');
        // for all exercises: add all tags starting with TE_2_ for all exercises that contain a tag in selected_te1:
        for(let me of metadata_exercises) {
            for(let tag of me["tags"]) {
                if(selected_te1.includes(tag) && tag.toLowerCase().startsWith("TE:2:")) {
                    
                    console.log(tag);
                }
            }
        }
    }


    //console.log(tax_selected);

    //tags_html += create_tax_desc('TE_2', 'II');
    //tags_html += '<div id="TE_2"></div>'
    //tags_html += create_tax_element('PartielleIntegration', 'Partielle Integration', 5);

    /*for(let i=0; i<metadata["tags-all"].length; i++) {
        let tag = metadata["tags-all"][i];
        if(tag.startsWith("TE:2:")) {
            let tag_displayed = tag.split(':');
            tag_displayed = tag_displayed[tag_displayed.length-1];
            tags_html += create_tax_element(tag.replaceAll(":","_"), tag_displayed);
        }
    }*/

    let te3div = document.getElementById("TE_2");
    te3div.innerHTML += create_tax_desc('TE_2', 'II');
}

let exercise_template = `
    <div class="card bg-white border-primary p-0">
        <div class="card-body m-0 p-2">
            <small>!EXERCISE_TYPE! &nbsp;</small>
            <h5 class="card-title"><b>!TITLE!</b></h5>
            <p class="card-text">
                !TAGS!
            </p>
            <div id="carousel_!EXERCISE_ID!" class="carousel carousel-dark slide" data-bs-ride="carousel" data-bs-interval="false">
                <div class="carousel-indicators">
                    <button type="button" data-bs-target="#carousel_!EXERCISE_ID!" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carousel_!EXERCISE_ID!" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carousel_!EXERCISE_ID!" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div class="carousel-inner">
                    <div class="carousel-item active">
                    <img src="Data/!EXERCISE_ID!_0.png" class="img-fluid" alt="TODO: VORSCHAUBILD">
                    </div>
                    <div class="carousel-item">
                    <img src="Data/!EXERCISE_ID!_1.png" class="img-fluid" alt="TODO: VORSCHAUBILD">
                    </div>
                    <div class="carousel-item">
                    <img src="Data/!EXERCISE_ID!_2.png" class="img-fluid" alt="TODO: VORSCHAUBILD">
                    </div>
                </div>
            </div>
        </div>
        <div class="text-center m-1">
            <div class="btn-group" role="group" aria-label="Basic example">
                !OPTIONAL_BUTTONS!
                <button type="button" 
                    class="btn btn-outline-primary btn-sm" 
                    onclick="download_exercise('!EXERCISE_ID!')"
                    data-toggle="tooltip" 
                    data-placement="top" 
                    title="Aufgabe im Format Moodle-XML Downloaden">
                    <i class="fa fa-download" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    </div>
`;

let select_exercise_template = `
    <button type="button" 
        class="btn btn-outline-primary btn-sm"    
        onclick="select_exercise('!EXERCISE_ID!')" 
        id="btn_select_exercise_!EXERCISE_ID!"
        data-toggle="tooltip" 
        data-placement="top" 
        title="Zum Aufgabenblatt hinzufügen">
        <!--<i class="fa fa-shopping-cart"></i>-->
        <i class="fa fa-book"></i>
    </button>
`;

let remove_exercise_template = `
    <button type="button" 
        class="btn btn-outline-primary btn-sm"    
        onclick="remove_exercise('!EXERCISE_ID!')" 
        id="btn_remove_exercise_!EXERCISE_ID!"
        data-toggle="tooltip" 
        data-placement="top" 
        title="Vom Aufgabenblatt entfernen">
        <i class="fa fa-ban"></i>
    </button>
`;

function build_exercise(exercise, isBasket=false) {
    let exercise_html = exercise_template;
    if(isBasket)
        exercise_html = exercise_html.replaceAll("carousel_", "carouselbasket_");
    let title = exercise["title"];
    if(title.startsWith('0'))  // TODO: remove this as soon as numbers are removed from Moodle
        title = title.substr(5);
    let optional_buttons = '';
    if(isBasket)
        optional_buttons += remove_exercise_template;
    else
        optional_buttons += select_exercise_template;
    exercise_html = exercise_html.replaceAll('!OPTIONAL_BUTTONS!', optional_buttons);
    exercise_html = exercise_html.replaceAll('!TITLE!', title);
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
    let exercise_tags_html = '';
    for(let j=0; j<exercise_tags.length; j++) {
        let tag_text = exercise_tags[j].replaceAll(':','_');
        let color = 'dark';
        if(tag_text.includes('Bloom'))
            color = 'success';
        else if(tag_text.includes('Maier'))
            color = 'primary';
        let category = '';
        let tokens = tag_text.split("_");
        if(tokens.length > 1) {
            for(let k=0; k<tokens.length-1; k++) {
                if(k > 0)
                    category += '_';
                category += tokens[k];
            }
        }
        if(tag_text in tax_texts) {
            if(category in category_texts)
                category = category_texts[category];
            tag_text = category + ': ' + tax_texts[tag_text];
        }
        exercise_tags_html += '<span class="badge rounded-pill bg-' + color + '">' + tag_text + '</span>&nbsp;';
    }
    exercise_html = exercise_html.replaceAll('!TAGS!', exercise_tags_html);
    return exercise_html;
}

function build_exercises_tree() {
    let exercises_html = '';
    for(let i=0; i<metadata_exercises.length; i++) {
        let display_exercise = true;
        let exercise = metadata_exercises[i];
        let exercise_html = build_exercise(exercise, false);
        let exercise_tags = exercise['tags'];

        /*let exercise_tags_underscore = [];
        for(let t of exercise_tags) { // TODO: do this only once!!
            exercise_tags_underscore.push(t.replaceAll(":","_"));
        }
        

        for(let t of exercise_tags_underscore) {
            if(tax_selected[t] == undefined)
                continue;
            if(tax_selected[t] == false)
                display_exercise = false;
        }*/
        
        
        for(let t in tax_selected) {
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
            display_exercise = false;

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
    let metadata_path = 'Data/meta.json' + '?time=' + timestamp;
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
            getTaxonomyData();
            
        },
        error: function(xhr, status, error) {
            alert("ERROR: " + xhr.responseText);
        }
    });
}

function getTaxonomyData() {
    let timestamp = Math.round((new Date()).getTime() / 1000);
    let metadata_path = 'Taxonomie/taxonomie.txt' + '?time=' + timestamp;
    $.ajax({
        url: metadata_path,
        type: 'GET',
        success: function(data,status,xhr) {
            taxonomyData = [];
            let lines = xhr.responseText.split("\n");
            for(let i=0; i<lines.length; i++) {
                let line = lines[i];
                if(line.length == 0)
                    continue;
                let tabs = 0;
                for(let j=0; j<line.length; j++) {
                    if(line[j] == ' ')
                        tabs ++;
                    else if(line[j] == '\t')
                        tabs += 4;
                    else
                        break;
                }
                tabs /= 4;
                if(tabs == 0)
                    taxonomyData
                        .push([line.trim()]);
                else if(tabs == 1)
                    taxonomyData[taxonomyData.length-1]
                        .push([line.trim()]);
                else if(tabs == 2)
                    taxonomyData[taxonomyData.length-1]
                        [taxonomyData[taxonomyData.length-1].length-1]
                        .push([line.trim()]);
                //console.log(tabs)
                //console.log(line)
            }
            //console.log(taxonomyData);
            build_document();
        },
        error: function(xhr, status, error) {
            alert("ERROR: " + xhr.responseText);
        }
    });
}

function toggleTag(tag_idx : number) {
    let buttonData = tag_button_data[tag_idx]
    let tagElement = document.getElementById("button_tag_" + tag_idx);
    buttonData.selected = !buttonData.selected;
    if(buttonData.selected)
        tagElement.setAttribute("class", "btn btn-" + buttonData.color + " btn-sm m-1");
    else
        tagElement.setAttribute("class", "btn btn-outline-" + buttonData.color + " btn-sm m-1");
    build_exercises_tree();
}

function select_exercise(idx : number) {
    // only push to basket, if not already done
    for(let i=0; i<basket.length; i++) {
        if(basket[i] == idx)
            return;
    }
    // push
    basket.push(idx);
}

function remove_exercise(idx : number) {
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

function download_selected_exercises(idx : number) {
    alert("... noch nicht implementiert");
}

function download_exercise(idx : number) {
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
