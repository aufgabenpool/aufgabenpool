<?php

$msg = '' . time() . '#' . $_POST['moodleID'] . '#' . $_POST['stars'] . "\n";

file_put_contents('feedback/rating.txt', $msg, FILE_APPEND);

?>
