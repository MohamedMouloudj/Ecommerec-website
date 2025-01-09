<?php

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowedOrigins = ['http://localhost:1234', '*']; // Add all allowed origins
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    } else {
        header("HTTP/1.1 403 Forbidden");
        exit("CORS policy: Origin not allowed");
    }
} else {
    header("HTTP/1.1 403 Forbidden");
    exit("CORS policy: Origin not specified");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Exit after handling the preflight request
}

// Configure session cookie parameters
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '0'); // Set to 1 if using HTTPS
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_domain', 'localhost');
ini_set('session.cookie_path', '/');


session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$pdo = include 'database.php';
$adminSecret = $env['ADMIN_SECRET'];
