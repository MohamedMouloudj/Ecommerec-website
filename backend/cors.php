<?php
// Edited from StackOverflow: https://stackoverflow.com/questions/8719276/cross-origin-request-headerscors-with-php-headers

// Enable error reporting (for debugging)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set session cookie parameters BEFORE session_start()
ini_set('session.cookie_domain', ''); // Empty string lets browser set domain automatically
ini_set('session.cookie_path', '/');
ini_set('session.cookie_secure', '0'); // Set to 1 if using HTTPS (in production, needs cert)
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'None'); // Required for cross-origin

ini_set('session.use_cookies', 1);
ini_set('session.use_only_cookies', 1);

function cors()
{
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        $allowedOrigins = ['http://localhost:1234'];

        if (in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
            header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
            header("Access-Control-Allow-Credentials: true");
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
            header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
            header('Access-Control-Max-Age: 86400');
        }
    }

    // if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    //     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
    //         header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    //     }

    //     if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
    //         header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    //     }
    //     exit(0);
    // }
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}


// Important: Don't include the port in the cookie domain
session_set_cookie_params([
    'lifetime' => 0,                // Session lasts until the browser is closed
    'path' => '/',                  // Cookie is available site-wide
    'domain' => 'localhost',        // Match your domain, without a port number
    'secure' => false,              // Use `true` for HTTPS, `false` for HTTP
    'httponly' => true,             // Prevent JavaScript from accessing cookies
    'samesite' => 'None',           // Required for cross-origin requests
]);


// Start session before CORS
session_start();

// Then I call CORS
cors();
