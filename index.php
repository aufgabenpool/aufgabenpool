<!DOCTYPE html>
<html lang="en">
    <?php include 'head.php'; ?>
    <body>

        <?php include 'title.php'; ?>

        <br/>


        <!--<div id="myCaptcha"></div>
        <button id="xxsubmit" type="button" class="btn btn-primary">blub</button>-->
        <!--
        <form action="?" method="POST">
            <div class="g-recaptcha" data-sitekey="6Lca4GQfAAAAALPpkGPIrkEJjNlxNCJvtN8SXE_9">
            </div>
            <br/>
            <input type="submit" value="Submit">
        </form>
        -->

        <div class="container px-0">
            <div class="row px-0">

                <div class="col-lg py-1">
                    <div class="card h-100 border-0">
                        <img class="card-img-top my-2 pt-3" src="img/icon-new-2.png" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">Aufgabenpool</h5>
                            <p class="card-text">
                                <ul>
                                    <li>Zentrale Sammlung von STACK-basierten Mathematikaufgaben für Moodle und Ilias.</li>
                                </ul>
                            </p>
                            <p class=""><a href="pool.php" class="btn btn-outline-dark w-100"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>
                        </div>
                    </div>
                </div>

                <div class="col-lg py-1">
                    <div class="card h-100 border-0">
                        <img class="card-img-top my-2 pt-3" src="img/sheets-2.png" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">Verwendbar für ...</h5>
                            <p class="card-text">
                                <ul>
                                    <li>Hausaufgaben</li>
                                    <li>Übung und Training</li>
                                    <li>Prüfungsvorleistungen</li>
                                    <li>Digitale Prüfungen</li>
                                </ul>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-lg py-1">
                    <div class="card h-100 border-0">
                        <img class="card-img-top my-2 pt-3" src="img/tax-2.png" alt="Card image cap">
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
                        </div>
                    </div>
                </div>

                <div class="col-lg py-1">
                    <div class="card h-100 border-0">
                        <img class="card-img-top my-2 pt-3" src="img/moodle.png" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">Fragendatenbank</h5>
                            <p class="card-text">
                                <ul>
                                    <li>Moodle-Kurs zur Verwaltung der Fragendatenbank <i>(eingeschränkter Zugriff)</i>
                                    </li>
                                </ul>
                            </p>
                            <p class=""><a href="https://aufgabenpool.f07-its.fh-koeln.de/moodle/login/index.php" class="btn btn-outline-dark w-100" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <br/>

        <div class="container px-0">
            <div class="row px-0 text-center">
                <div class="col-lg py-1">
                    <div class="card h-100 border-0">
                        <!--<img class="card-img-top my-2" src="img/sheets-2.png" alt="Card image cap">-->
                        <div class="card-body">
                            <!--<span class="display-5">
                                <i class="fa-solid fa-share-nodes"></i>
                            </span>-->
                            <img src="img/collab.gif" style="height:50pt"/>
                            <h5 class="card-title mt-2">
                                Interesse an einer Zusammenarbeit?<br/> Möchten Sie Ihre Aufgaben zum Aufgabenpool hinzufügen?<br/> Sprechen Sie uns an!
                            </h5>
                            <!--<p>Wenden Sie sich gerne an <span class="text-dark">TODO: wer möchte hier stehen??</span></p>-->
                        </div>
                    </div>
                </div>

            </div>
        </div>



        <script>
            document.getElementById("link-start").innerHTML = '<b><span class="text-danger">Startseite</span></b>';
        </script>

        <?php include 'footer.php'; ?>

        <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>


        <script>
            /*var verifyCallback = function( response ) {
                console.log( 'g-recaptcha-response: ' + response );
            };

            var captchaWidgetId = null;

            function onReCaptchaLoad() {
                captchaWidgetId = grecaptcha.render( 'myCaptcha', {
                    'sitekey' : '6Lca4GQfAAAAALPpkGPIrkEJjNlxNCJvtN8SXE_9',
                    'theme' : 'light',
                    'callback': 'verifyCallback'
                });
            }

            document.getElementById("xxsubmit").onclick = function() {
                var response = grecaptcha.getResponse(captchaWidgetId);
                console.log('g-recaptcha-response: ' + response);
                // TODO
            };*/
        </script>

    </body>

</html>
