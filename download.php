<?php

$msg = '' . time() . '#' . $_POST['moodleID'] . "\n";

file_put_contents('feedback/downloads.txt', $msg, FILE_APPEND);

?>
