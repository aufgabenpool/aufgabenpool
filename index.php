<!DOCTYPE html>
<html lang="en">
<?php include 'head.php'; ?>
<body>
    <?php /*include 'nav.php';*/ ?>

    <?php include 'title.php'; ?>

    <br/>

    <div class="container px-0">
        <div class="row px-0">
            
            <div class="col-lg py-1">
                <div class="card h-100">
                    <img class="card-img-top my-2" src="img/sheets-2.png" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">Verwendbar für</h5>
                        <p class="card-text">
                            <ul>
                                <li>Hausaufgaben</li>
                                <li>Übung und Training</li>
                                <li>Prüfungsvorleistungen</li>
                                <li>Digitale Prüfungen</li>
                            </ul>
                        </p>
                        <!--<a href="#" class="btn btn-primary">Go somewhere</a>-->
                    </div>
                </div>
            </div>
            <div class="col-lg py-1">
                <div class="card h-100">
                    <img class="card-img-top my-2" src="img/tax-2.png" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">Eingesetzte Taxonomien</h5>
                        <p class="card-text">
                            <ul>
                                <li>Bloom et al. (1972)</li>
                                <li>Maier u.a. (2014)</li>
                                <li>Aufgabentypen</li>
                                <li>Inhaltsbereiche</li>
                            </ul>
                        </p>
                        <!--<a href="#" class="btn btn-primary">Go somewhere</a>-->
                    </div>
                </div>
            </div>
            <div class="col-lg py-1">
                <div class="card h-100">
                    <img class="card-img-top my-2" src="img/icon-new-2.png" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">Aufgabenpool</h5>
                        <p class="card-text">Zentrale Sammlung von STACK-basierten Mathematikaufgaben für Moodle und Ilias.</p>
                        <p class=""><a href="pool.php" class="btn btn-primary btn-danger">Link</a></p>
                    </div>
                </div>
            </div>
            <div class="col-lg py-1">
                <div class="card h-100">
                    <img class="card-img-top my-2" src="img/moodle.png" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">Fragendatenbank</h5>
                        <p class="card-text">Moodle-Kurs zur Verwaltung der Fragendatenbank (mit beschränktem Zugriff).</p>
                        <p class=""><a href="https://aufgabenpool.f07-its.fh-koeln.de/moodle" class="btn btn-primary btn-danger">Link</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById("link-start").innerHTML = '<b><span class="text-danger">Startseite</span></b>';
    </script>

    <?php include 'footer.php'; ?>

    <?php include 'body_scripts.php'; ?>
</body>
