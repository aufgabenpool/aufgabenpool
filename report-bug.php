<?php

$captcha = $_POST['googleRecaptcha'];

$secretKey = "6Lca4GQfAAAAANxN-DjRBEOdlbl5fU-b_5xfd6Nz";
$url = 'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secretKey) .  '&response=' . urlencode($captcha);
$response = file_get_contents($url);
$responseKeys = json_decode($response,true);
if($responseKeys["success"]) {
    echo 'success';
    file_put_contents('feedback/bugs.txt', $_POST['msg'], FILE_APPEND);
} else {
    echo 'error';
}

?>
