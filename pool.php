<!DOCTYPE html>
<html lang="en">
<?php include 'head.php'; ?>
<body>
    <?php include 'nav.php'; ?>

    <br/>
    <blockquote class="blockquote text-center">
        <h1><b>Digitaler Aufgabenpool Mathematik</b></h1>
        <h2>Kompetenzorientiertes digitales Prüfen</h2>
    </blockquote>

    <div class="container">
        <div class="row">
            <div class="col-lg">
                <p>
                    Diese Webseite zum Projekt "digitaler Aufgabenpool Mathematik" befindet sich momentan noch im Aufbau.
                    <br/>
                    Das Projekt wird gefördert durch
                    <i>"Fellowships für Innovationen in der digitalen Hochschullehre NRW" (digiFellow)</i> <a href="https://www.stifterverband.org/digital-lehrfellows-nrw" target="_blank">Link</a>.
                </p>
                <p><small><i>(Zuletzt aktualisiert: <span id="pool-date"></span>)</i></small></p>
            </div>    
        </div>        
    </div>

    <br/>


    <div class="container">
        <div class="row">
            <div class="col-lg bg-white px-0">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a id="pool-tab" class="nav-link active" href="#" onclick="aufgabenpool.clicked_on_pool_tab();"><b>Aufgabenpool</b></a>
                    </li>
                    <li class="nav-item">
                        <a id="basket-tab" class="nav-link" href="#" onclick="aufgabenpool.clicked_on_basket_tab();"><b>Aufgabenblatt</b></a>
                    </li>
                </ul>
                <div class="border border-dark border-top-0 p-1">
                    <div id="taglist_div" class="m-3"></div>
                    <div id="exercises_div" class="m-3"></div>
                    <div id="basket_div" class="m-3" style="display: none;"></div>
                    <!--<p class="p-1"><button type="button" class="btn btn-outline-primary btn-sm" onclick="download_selected_exercises();">Ausgewählte Aufgaben downloaden</button></p>
                    <p class="p-1"><button type="button" class="btn btn-outline-primary btn-sm" onclick="download_selected_exercises();">Alle angezeigten Aufgaben downloaden</button></p>-->
                </div>
            </div>    
        </div>        
    </div>

    <?php include 'footer.php'; ?>

    <script src="build/js/aufgabenpool.min.js?v=< ?php echo time();?> "></script>

    <?php include 'body_scripts.php'; ?>
</body>
