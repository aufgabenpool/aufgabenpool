<!DOCTYPE html>
<html lang="en">
    <?php include 'head.php'; ?>
    <body>

        <?php include 'title.php'; ?>

        <br/>

        <div class="container bg-white">
            <div class="row py-2">
                <div class="col text-start m-2 lead">
                    <div id="devguide"></div>
                </div>
            </div>
        </div>

        <script>
            function generateContent(id) {
                axios.get("help/" + id + ".md?v="+Date.now()).then(function (response) {
                    html = new markdownit().render(response.data);

                    //html = html.replace(/<p>/g, "<p class=\"lead\">");
                    html = html.replace(/\"images/g, "\"help/images");
                    html = html.replace(/\<img src/g, "<img class=\"img-fluid shadow mx-5 my-2 p-2 w-75 rounded\" src");
                    html = html.replace(/<\/h1>/g, "</h1><hr/>");
                    html = html.replace(/<h2>/g, "<br/><h2>");
                    html = html.replace(/<\/h2>/g, "</h2><hr/>");

                    //console.log(html);

                    document.getElementById(id).innerHTML = html;
                });
            }

            generateContent('devguide');

        </script>

        <?php include 'footer.php'; ?>

        <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>

    </body>

</html>
