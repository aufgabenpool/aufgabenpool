<!DOCTYPE html>
<html lang="en">
<?php include 'head.php'; ?>
<body>
    <?php /*include 'nav.php';*/ ?>

    <?php include 'title.php'; ?>

    <br/>

    <div class="container">
        <div class="row">
            
            <div class="col-lg">
                <div class="card h-100" style="width: 18rem;">
                    <img class="card-img-top" src="img/istockphoto-925167552-612x612.png" alt="Card image cap">
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
            <div class="col-lg">
                <div class="card h-100" style="width: 18rem;">
                    <img class="card-img-top" src="img/tax.png" alt="Card image cap">
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
            <div class="col">
                <div class="card h-100" style="width: 18rem;">
                    <img class="card-img-top" src="img/istockphoto-925167552-612x612.png" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">Aufgabenpool</h5>
                        <p class="card-text">Zentrale Sammlung von STACK-basierten Mathematikaufgaben für Moodle und Ilias.</p>
                        <a href="pool.php" class="btn btn-primary">Direktzugang</a>
                    </div>
                </div>
            </div>
            <div class="col-lg">
                <div class="card h-100" style="width: 18rem;">
                    <img class="card-img-top" src="img/moodle.png" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">Fragendatenbank</h5>
                        <p class="card-text">Beschränkter Zugriff</p>
                        <a href="https://aufgabenpool.f07-its.fh-koeln.de/moodle" class="btn btn-primary">Moodle</a>
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
