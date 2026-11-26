<?php
declare(strict_types=1);

// Solo para desarrollo local en Laragon. No publiques credenciales root en producción.
$host = '127.0.0.1';
$database = 'inventario';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $exception) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'No fue posible conectar con la base de datos.'], JSON_UNESCAPED_UNICODE);
    exit;
}
