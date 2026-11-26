<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

function respond(array $data, int $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function readJsonBody(): array
{
    $decoded = json_decode(file_get_contents('php://input'), true);
    if (!is_array($decoded)) {
        respond(['error' => 'El cuerpo de la solicitud debe contener JSON válido.'], 400);
    }
    return $decoded;
}

function validateProduct(array $data): array
{
    $name = trim((string)($data['nombre'] ?? ''));
    $category = trim((string)($data['categoria'] ?? ''));
    $stockRaw = $data['stock'] ?? null;
    $stock = filter_var($stockRaw, FILTER_VALIDATE_INT);

    if ($name === '' || mb_strlen($name) > 100) {
        respond(['error' => 'El nombre es obligatorio y debe tener máximo 100 caracteres.'], 422);
    }
    if ($category === '' || mb_strlen($category) > 60) {
        respond(['error' => 'La categoría es obligatoria y debe tener máximo 60 caracteres.'], 422);
    }
    if ($stock === false || $stock < 0) {
        respond(['error' => 'Las existencias deben ser un número entero igual o mayor que cero.'], 422);
    }

    return [$name, $category, $stock];
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $statement = $pdo->query(
            'SELECT id, nombre, categoria, stock, fecha_registro FROM productos ORDER BY nombre ASC'
        );
        respond($statement->fetchAll());
    }

    if ($method === 'POST') {
        [$name, $category, $stock] = validateProduct(readJsonBody());
        $statement = $pdo->prepare(
            'INSERT INTO productos (nombre, categoria, stock) VALUES (:nombre, :categoria, :stock)'
        );
        $statement->execute(['nombre' => $name, 'categoria' => $category, 'stock' => $stock]);
        respond(['mensaje' => 'Producto registrado.', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($method === 'PUT') {
        $data = readJsonBody();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id === null || $id <= 0) {
            respond(['error' => 'El identificador del producto no es válido.'], 422);
        }
        [$name, $category, $stock] = validateProduct($data);

        $exists = $pdo->prepare('SELECT id FROM productos WHERE id = :id');
        $exists->execute(['id' => $id]);
        if (!$exists->fetch()) {
            respond(['error' => 'No se encontró el producto solicitado.'], 404);
        }

        $statement = $pdo->prepare(
            'UPDATE productos SET nombre = :nombre, categoria = :categoria, stock = :stock WHERE id = :id'
        );
        $statement->execute(['id' => $id, 'nombre' => $name, 'categoria' => $category, 'stock' => $stock]);
        respond(['mensaje' => 'Producto actualizado.']);
    }

    if ($method === 'DELETE') {
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id === null || $id <= 0) {
            respond(['error' => 'El identificador del producto no es válido.'], 422);
        }

        $statement = $pdo->prepare('DELETE FROM productos WHERE id = :id');
        $statement->execute(['id' => $id]);
        if ($statement->rowCount() === 0) {
            respond(['error' => 'No se encontró el producto solicitado.'], 404);
        }
        respond(['mensaje' => 'Producto eliminado.']);
    }

    header('Allow: GET, POST, PUT, DELETE');
    respond(['error' => 'Método no permitido.'], 405);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    respond(['error' => 'Ocurrió un error al procesar la operación.'], 500);
}
