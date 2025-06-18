<?php
require_once __DIR__ . '/../vendor/autoload.php';

static $pdo = null;
static $initialized = false;

if ($pdo !== null) {
    return $pdo;
}

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$env = $dotenv->load();

// SQLite database path
$dbPath = __DIR__ . '/ecommerce.db';

$dsn = "sqlite:$dbPath";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, null, null, $options);

    // Enable foreign key constraints for SQLite
    $pdo->exec('PRAGMA foreign_keys = ON');

    // Only initialize once
    if (!$initialized) {
        // Check if database is empty and needs initialization
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'");
        $result = $stmt->fetch();

        if ($result['count'] == 0) {
            // Database is empty, create tables and insert sample data
            $schemaFile = __DIR__ . '/../schema.sql';
            if (file_exists($schemaFile)) {
                $schema = file_get_contents($schemaFile);
                $pdo->exec($schema);
            }
        }
        $initialized = true;
    }
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

return $pdo;
