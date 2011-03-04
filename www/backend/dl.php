<?php

// dl.php
// by Colin Kuebler
// 2011-01-06
// This php script accepts text via post and generates a file for download

if( isset($_POST['code']) && isset($_POST['title']) ){
	header('Content-Type: application/txt');
	header('Content-Disposition: attachment; filename='.$_POST['title']);
	echo $_POST['title'];
	echo "\nby ";
	echo $_POST['author'];
	echo "\n\n";
	echo $_POST['code'];
} else echo "<h1>Error</h1>Internal error 20110106 has occurred";

?>
