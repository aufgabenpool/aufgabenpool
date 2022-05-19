/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

// TODO: exercise type invisible!!

export let exercise_template = `
    <div class="col bg-white rounded">
        <div class="card-body m-0 p-2">
            <p class="text-center card-text mx-2 my-0 py-0">!TOPIC!</p>
            <h2 class="my-0 py-3 text-center"><b>!TITLE!</b></h2>
            <p class="card-text text-center">!TAGS!</p>
            <!--<div class="shadow py-2 my-4 mx-2 bg-white rounded">-->
            <div class="pt-2">
                <img id="preview_!EXERCISE_MOODLE_ID!" src="data/!EXERCISE_MOODLE_ID!_0.png" class="img-fluid" alt="TODO: https://aufgabenpool.th-koeln.de/moodle/question/type/stack/questiontestrun.php?questionid=???&courseid=2">
            </div>
        </div>
        <div class="row mx-1 my-2">
            <div class="col mx-0 my-2 text-center">
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button id="preview_btn0_!EXERCISE_MOODLE_ID!" type="button"
                        class="btn btn-outline-dark btn-sm active"
                        onclick="aufgabenpool.setImage('!EXERCISE_MOODLE_ID!', 0)"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Vorschau 1">
                        1
                    </button>
                    <button id="preview_btn1_!EXERCISE_MOODLE_ID!" type="button"
                        class="btn btn-outline-dark btn-sm"
                        onclick="aufgabenpool.setImage('!EXERCISE_MOODLE_ID!', 1)"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Vorschau 2">
                        2
                    </button>
                    <button id="preview_btn2_!EXERCISE_MOODLE_ID!" type="button"
                        class="btn btn-outline-dark btn-sm"
                        onclick="aufgabenpool.setImage('!EXERCISE_MOODLE_ID!', 2)"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Vorschau 3">
                        3
                    </button>
                    <button id="preview_btn3_!EXERCISE_MOODLE_ID!" type="button"
                        class="btn btn-outline-dark btn-sm"
                        onclick="aufgabenpool.setImage('!EXERCISE_MOODLE_ID!', 3)"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Vorschau Lösungsweg">
                        <i class="far fa-lightbulb"></i>
                    </button>
                </div>
                &nbsp;&nbsp;
                <div class="btn-group" role="group" aria-label="Basic example">
                    !OPTIONAL_BUTTONS!
                    <button type="button"
                        class="btn btn-outline-dark btn-sm"
                        onclick="aufgabenpool.download_exercise('!EXERCISE_ID!')"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Aufgabe im Format Moodle-XML herunterladen">
                        <i class="fa fa-download" aria-hidden="true"></i>
                    </button>
                    <button type="button"
                        class="btn btn-outline-dark btn-sm"
                        onclick="aufgabenpool.edit_exercise('!EXERCISE_ID!')"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Aufgabe in Moodle editieren">
                        <i class="fa fa-edit" aria-hidden="true"></i>
                    </button>
                    <button type="button"
                        class="btn btn-outline-dark btn-sm"
                        onclick="aufgabenpool.report_bug('!EXERCISE_ID!')"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Fehler melden">
                        <i class="fas fa-bug" aria-hidden="true"></i>
                    </button>
                </div>
                &nbsp;&nbsp;
                <div class="btn-group" role="group" aria-label="Basic example">
                    <span class="btn btn-outline-dark btn-sm">
                        <span id="rating1">
                            <i class="far fa-star"></i>
                        </span>
                        <span id="rating2">
                            <i class="far fa-star"></i>
                        </span>
                        <span id="rating3">
                            <i class="far fa-star"></i>
                        </span>
                        <span id="rating4">
                            <i class="far fa-star"></i>
                        </span>
                        <span id="rating5">
                            <i class="far fa-star"></i>
                        </span>
                    </span>
                </div>
            </div>
        </div>
    </div>
`;

export let add_exercise_to_basket_template = `
    <button type="button"
        class="btn btn-outline-dark btn-sm"
        onclick="aufgabenpool.add_exercise_to_basket('!EXERCISE_ID!')"
        id="btn_add_exercise_to_basket_!EXERCISE_ID!"
        data-toggle="tooltip"
        data-placement="top"
        title="Zum Aufgabenblatt hinzufügen">
        <!--<i class="fa fa-shopping-cart"></i>-->
        <i class="fa fa-book"></i>
    </button>
`;

export let remove_exercise_template = `
    <button type="button"
        class="btn btn-outline-dark btn-sm"
        onclick="aufgabenpool.remove_exercise('!EXERCISE_ID!')"
        id="btn_remove_exercise_!EXERCISE_ID!"
        data-toggle="tooltip"
        data-placement="top"
        title="Vom Aufgabenblatt entfernen">
        <i class="fa fa-ban"></i>
    </button>
`;
