<?php

$msg = '' . time() . '#' . $_POST['id'] . "\n";

file_put_contents('feedback/taxonomy.txt', $msg, FILE_APPEND);

?>
