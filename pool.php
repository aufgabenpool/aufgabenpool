<!DOCTYPE html>
<html lang="en">
    <?php include 'head.php'; ?>
    <body>
        <?php include 'title.php'; ?>

        <?php include 'pool-modals.php'; ?>

        <br/>

        <div class="container col bg-white">

            <div class="row py-2">
                <div class="col text-center lead">
                    <a href="help-user.php" target="_blank" style="text-decoration: none; color: black;">
                        <i class="fa-regular fa-circle-question"></i>
                        Hilfe
                    </a>
                </div>
            </div>

            <div class="row py-2">
                <div class="col">
                </div>
                <div class="col text-center">
                    <div class="btn-group">
                        <a id="pool-button" onclick="aufgabenpool.selectPool();" class="btn btn-danger" aria-current="page">Fragensammlung</a>
                        <a id="worksheet-button" onclick="aufgabenpool.selectWorksheet();" class="btn btn-outline-danger">Aufgabenblatt</a>
                    </div>
                </div>
                <div class="col text-end">
                    <span class="nav-link disabled">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stand: <span id="pool-date"></span></span>
                </div>
            </div>

            <!--<div class="row px-3">
                <div class="col">
                    <form class="form-inline my-2 my-lg-0">
                        <input class="form-control mr-sm-2" type="search" placeholder="Suche" aria-label="Search">
                        < !--<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>-- >
                    </form>
                </div>
            </div>-->

            <div class="row">
                <div class="col bg-white">
                    <div>
                        <div id="taglist_div" class="m-3"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container px-0">
            <div class="row mx-0 px-0">
                <div class="col mx-0 px-0">
                    <div id="exercises_div" class="mx-0 my-3"></div>
                    <div id="basket_div" class="mx-0 my-3" style="display: none;"></div>
                </div>
            </div>
        </div>

        <script>
            document.getElementById("link-pool").innerHTML = '<b><span class="text-danger">Aufgabenpool</span></b>';
        </script>

        <?php include 'footer.php'; ?>

        <script src="build/js/aufgabenpool.min.js?v=<?php echo time();?>"></script>

        <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>

        <script>

            // redirect to new URL
            if(window.location.href.includes('f07-its.fh-koeln.de')) {
                window.location = 'https://aufgabenpool.th-koeln.de/index.php', true;
            }

            aufgabenpool.init();
        </script>

    </body>
</html>
