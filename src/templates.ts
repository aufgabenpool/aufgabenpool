/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

// TODO: exercise type invisible!!

export let exercise_template = `
    <div class="card bg-white border-dark p-0">
        <div class="card-body m-0 p-2">
            <p class="card-text my-0 py-0">!TOPIC!</p>
            <h2 class="my-0 py-1">!TITLE!</h2>
            <p class="card-text">!TAGS!</p>
            <div id="carousel_!EXERCISE_ID!" class="carousel carousel-dark slide" data-bs-ride="carousel" data-bs-interval="false">
                <div class="carousel-indicators">
                    <button type="button" data-bs-target="#carousel_!EXERCISE_ID!" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carousel_!EXERCISE_ID!" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carousel_!EXERCISE_ID!" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div class="carousel-inner">
                    <div class="carousel-item active">
                    <img src="data/!EXERCISE_MOODLE_ID!_0.png" class="img-fluid" alt="TODO: VORSCHAUBILD">
                    </div>
                    <div class="carousel-item">
                    <img src="data/!EXERCISE_MOODLE_ID!_1.png" class="img-fluid" alt="TODO: VORSCHAUBILD">
                    </div>
                    <div class="carousel-item">
                    <img src="data/!EXERCISE_MOODLE_ID!_2.png" class="img-fluid" alt="TODO: VORSCHAUBILD">
                    </div>
                </div>
            </div>
        </div>
        <div class="text-center m-1">
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
