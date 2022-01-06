<!DOCTYPE html>
<html lang="en">
    <?php include 'head.php'; ?>
    <body>
        <?php include 'title.php'; ?>

        <br/>

        <div class="container col bg-white">

            <br/>

            <div class="row py-2">
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
                        <!--<div id="exercises_div" class="m-3"></div>
                        <div id="basket_div" class="m-3" style="display: none;"></div>-->
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row mx-0">
                <div class="col mx-0">
                    <!--<div class="mx-0">-->
                        <!--<div id="taglist_div" class="m-3"></div>-->
                        <div id="exercises_div" class="mx-0 my-3"></div>
                        <div id="basket_div" class="mx-0 my-3" style="display: none;"></div>
                    <!--</div>-->
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
            pool.init();
        </script>

    </body>
</html>
