<!DOCTYPE html>
<html lang="en">
<?php include 'head.php'; ?>
<body>
    <?php /*include 'nav.php';*/ ?>

    <!--<br/>
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
    </div>-->

    <?php include 'title.php'; ?>

    <br/>

    <div class="container col bg-white">

        <br/>
        
        <div class="row py-2">
            <!--<div class="col-lg bg-white px-0">-->
            <div class="col">
            </div>
            <div class="col text-center">
                <div class="btn-group">
                    <a id="pool-button" onclick="aufgabenpool.clicked_on_pool_tab();" class="btn btn-danger active" aria-current="page">Fragensammlung</a>
                    <a id="basket-button" onclick="aufgabenpool.clicked_on_basket_tab();" class="btn btn-outline-danger">Aufgabenblatt</a>
                </div>
            </div>
            <div class="col text-end">
                <span class="nav-link disabled">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stand: <span id="pool-date"></span></span>
            </div>
        </div>

        <div class="row">
            <div class="col bg-white">
                <!--<ul class="nav nav-tabs" style="border-color: #000000;">
                    <li class="nav-item">
                        <a id="pool-tab" class="nav-link active" href="#" onclick="aufgabenpool.clicked_on_pool_tab();"><b>Fragensammlung</b></a>
                    </li>
                    <li class="nav-item">
                        <a id="basket-tab" class="nav-link" href="#" onclick="aufgabenpool.clicked_on_basket_tab();"><b>Aufgabenblatt</b></a>
                    </li>
                    <li class="nav-item">
                        <span class="nav-link disabled">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stand: <span id="pool-date"></span></span>
                    </li>
                </ul>-->
                <!--<div class="border border-dark border-top-0 p-1">-->
                <div>
                    <div id="taglist_div" class="m-3"></div>
                    <div id="exercises_div" class="m-3"></div>
                    <div id="basket_div" class="m-3" style="display: none;"></div>
                    <!--<p class="p-1"><button type="button" class="btn btn-outline-primary btn-sm" onclick="download_selected_exercises();">Ausgewählte Aufgaben downloaden</button></p>
                    <p class="p-1"><button type="button" class="btn btn-outline-primary btn-sm" onclick="download_selected_exercises();">Alle angezeigten Aufgaben downloaden</button></p>-->
                </div>
            </div>    
        </div>        
    </div>

    <script>
        document.getElementById("link-pool").innerHTML = '<b><span class="text-danger">Aufgabenpool</span></b>';
    </script>

    <?php include 'footer.php'; ?>

    <script src="build/js/aufgabenpool.min.js?v=< ?php echo time();?> "></script>

    <?php include 'body_scripts.php'; ?>
</body>
