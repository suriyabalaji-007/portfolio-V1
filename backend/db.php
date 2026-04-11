<?php
$host = "localhost";
$user = "root";   // default in XAMPP
$pass = "";       // empty password
$db   = "portfolio";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("DB connection failed: " . $conn->connect_error);
}
?>
