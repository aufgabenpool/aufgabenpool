<!DOCTYPE html>
<html lang="en">
    <?php include 'head.php'; ?>
    <body>

        <?php include 'title.php'; ?>

        <br/>

        <div class="container bg-white">
            <div class="row py-2">
                <div class="col-lg text-start text-danger">
                    Hinweis: Diese Hilfeseite befindet sich momentan noch im Aufbau
                </div>
            </div>
        </div>

        <div id="collaboration"></div>
        <div id="topics"></div>

        <script>
            document.getElementById("link-help").innerHTML = '<b><span class="text-danger">Hilfe</span></b>';

            function generateContent(id) {
                axios.get("help/" + id + ".md").then(function (response) {
                    html = new markdownit().render(response.data);
                    document.getElementById(id).innerHTML += `
                    <br/>
                    <div class="container bg-white">
                        <div class="row py-2">
                            <div class="col-lg text-start">
                                ` + html + `
                            </div>
                        </div>
                    </div>
                    `;
                });
            }

            generateContent('collaboration');
            generateContent('topics');

        </script>

        <?php include 'footer.php'; ?>

        <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>

    </body>

</html>
