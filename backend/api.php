<?php

include 'cors.php';

$pdo = include 'database.php';
$adminSecret = $env['ADMIN_SECRET'];


// Parse URL, I divided routes based on url string, I could separate them into files, but I already created a lot of files
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'], '/'));


function sendResponse($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Router Logic
if ($path[0] === 'categories') {
    if ($requestMethod === 'GET') {
        // GET /categories
        $statement = $pdo->prepare('SELECT name FROM category');
        $statement->execute();
        $categories = $statement->fetchAll();
        $categories = array_map(function ($category) {
            return $category['name'];
        }, $categories);
        if (!$categories) {
            sendResponse(["error" => "No categories found"], 404);
        }
        sendResponse($categories, 200);
    } elseif ($requestMethod === 'POST') {
        // POST /categories
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['name'])) {
            sendResponse(["error" => "Invalid data"], 400);
        }
        $statement = $pdo->prepare('INSERT INTO category (name) VALUES (:name)');
        $statement->execute(['name' => $input['name']]);
        sendResponse(["message" => "Category created successfully"], 200);
    }
} elseif ($path[0] === 'products') {
    if ($requestMethod === 'GET') {
        if (isset($path[1])) {
            // GET /products/{id}
            $productId = (int)$path[1];
            $statement = $pdo->prepare('SELECT * FROM product WHERE id = :id');
            $statement->execute(['id' => $productId]);
            $product = $statement->fetch();
            $statement = $pdo->prepare('SELECT * FROM productimage WHERE productId = :id');
            $statement->execute(['id' => $productId]);
            $productImages = $statement->fetchAll();
            $statement = $pdo->prepare('SELECT * FROM dimensions WHERE productId = :id');
            $statement->execute(['id' => $productId]);
            $dimensions = $statement->fetch();
            $statement = $pdo->prepare('SELECT * FROM category WHERE id = :id');
            $statement->execute(['id' => $product['categoryId']]);
            $category = $statement->fetch();
            if ($product) {
                $product['thumbnail'] = '';
                $product['images'] = [];
                foreach ($productImages as $productImage) {
                    if ($productImage['isThumbnail'] === 1) {
                        $product['thumbnail'] = $productImage['url'];
                        $product['images'][] = $productImage['url'];
                    } else {
                        $product['images'][] = $productImage['url'];
                    }
                }
                $product['tags'] = explode(" ", $product['tags']);
                $product['dimensions'] = $dimensions;
                $product['category'] = $category['name'];
                sendResponse($product);
            } else {
                sendResponse(["error" => "Product not found"], 404);
            }
        } else {
            // GET /products
            $statement = $pdo->prepare('SELECT * FROM product');
            $statement->execute();
            $products = $statement->fetchAll();
            if (!$products) {
                sendResponse(["error" => "No products found"], 404);
            }
            $statement = $pdo->prepare('SELECT * FROM productimage');
            $statement->execute();
            $productImages = $statement->fetchAll();
            $statement = $pdo->prepare('SELECT * FROM dimensions');
            $statement->execute();
            $dimensions = $statement->fetchAll();
            $statement = $pdo->prepare('SELECT * FROM category');
            $statement->execute();
            $categories = $statement->fetchAll();
            foreach ($products as &$product) {
                $product['thumbnail'] = '';
                $product['images'] = [];
                foreach ($productImages as $productImage) {
                    if ($product['id'] === $productImage['productId'] && $productImage['isThumbnail'] === 1) {
                        $product['thumbnail'] = $productImage['url'];
                        $product['images'][] = $productImage['url'];
                    } elseif ($product['id'] === $productImage['productId']) {
                        $product['images'][] = $productImage['url'];
                    }
                }
                $product['tags'] = explode(" ", $product['tags']);
                foreach ($dimensions as $dimension) {
                    if ($product['id'] === $dimension['productId']) {
                        $product['dimensions'] = $dimension;
                    }
                }
                $product['category'] = '';
                foreach ($categories as $category) {
                    if ($product['categoryId'] === $category['id']) {
                        $product['category'] = $category['name'];
                    }
                }
            }
            sendResponse($products);
        }
    }
} elseif ($path[0] === 'cart') {

    validateAuth();

    $clientId = $_SESSION['client']['id'];
    $cart['id'] = $_SESSION['cart']['id'];

    if ($requestMethod === 'GET') {
        // GET /cart
        $statement = $pdo->prepare('SELECT *, cartitem.quantity  FROM product INNER JOIN cartitem ON product.id = cartitem.productId WHERE cartitem.cartId = :cartId');
        $statement->execute(['cartId' => $cart['id']]);
        $products = $statement->fetchAll();

        foreach ($products as &$product) {
            $statement = $pdo->prepare('SELECT * FROM productimage WHERE productId = :productId AND isThumbnail = 1');
            $statement->execute(['productId' => $product['id']]);
            $productImages = $statement->fetchAll();
            $product['thumbnail'] = '';
            foreach ($productImages as $productImage) {
                if ($product['id'] === $productImage['productId']) {
                    $product['thumbnail'] = $productImage['url'];
                }
            }
            $statement = $pdo->prepare('SELECT * FROM category WHERE id = :id');
            $statement->execute(['id' => $product['categoryId']]);
            $category = $statement->fetch();
            $product['category'] = $category['name'];
        }


        sendResponse($products);
    } elseif ($requestMethod === 'POST') {
        // POST /cart
        $input = json_decode(file_get_contents('php://input'), true);
        $input['productId'] = $input['id'];
        if (empty($input['productId']) || empty($input['quantity'])) {
            sendResponse(["error" => "Invalid data"], 400);
        }

        $statement = $pdo->prepare('SELECT * FROM cartitem WHERE productId = :productId AND cartId = :cartId');
        $statement->execute([
            'productId' => $input['productId'],
            'cartId' => $cart['id'],
        ]);
        $cartItem = $statement->fetch();
        if ($cartItem) {
            $statement = $pdo->prepare('UPDATE cartitem SET quantity = :quantity WHERE productId = :productId AND cartId = :cartId');
            $statement->execute([
                'quantity' => $cartItem['quantity'],
                'productId' => $input['productId'],
                'cartId' => $cart['id'],
            ]);
        } else {
            $statement = $pdo->prepare('INSERT INTO cartitem (productId, cartId, quantity) VALUES (:productId, :cartId, :quantity)');
            $statement->execute([
                'productId' => $input['productId'],
                'cartId' => $cart['id'],
                'quantity' => $input['quantity'],
            ]);
        }
        sendResponse(["message" => "Item added to cart"], 200);
    } elseif ($requestMethod === 'DELETE') {
        // DELETE /cart
        error_log("Cart Delete Request Headers: " . print_r(getallheaders(), true));
        error_log("Cart Delete Session ID: " . session_id());

        $input = json_decode(file_get_contents('php://input'), true);
        error_log("input: " . print_r($input, true));

        if (empty($input['productId'])) {
            sendResponse(["error" => "Invalid data"], 400);
        }

        $statement = $pdo->prepare('DELETE FROM cartitem WHERE productId = :productId AND cartId = :cartId');
        $statement->execute([
            'productId' => $input['productId'],
            'cartId' => $cart['id'],
        ]);
        sendResponse(["message" => "Item removed from cart"], 200);
    }
} elseif ($path[0] === 'checkout') {
    if ($requestMethod === 'POST') {
        // POST /checkout
        // I should process order payment here, but this is just a simulation...
        $_SESSION['cart']['status'] = 'checked out';
        $_SESSION['cart']['checkoutDate'] = date('Y-m-d H:i:s');
        $statement = $pdo->prepare('UPDATE cart SET status = :status, checkoutDate = :checkoutDate WHERE id = :id');
        $statement->execute([
            'status' => $_SESSION['cart']['status'],
            'checkoutDate' => $_SESSION['cart']['checkoutDate'],
            'id' => $_SESSION['cart']['id'],
        ]);
        sendResponse(["message" => "Order processed successfully"]);
    }
} elseif ($path[0] === 'signup') {
    if ($requestMethod === 'POST') {
        // POST /signup

        if ($_SERVER['CONTENT_TYPE'] !== 'application/json') {
            sendResponse(["error" => "Invalid Content-Type"], 400);
            exit;
        }
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        if (empty($input['email']) || empty($input['password']) || empty($input['name'])) {
            sendResponse(["error" => "Missing required fields"], 400);
        }

        $existingUser = $pdo->prepare('SELECT * FROM client WHERE email = :email');
        $existingUser->execute(['email' => $input['email']]);
        if ($existingUser->fetch()) {
            sendResponse(["error" => "User already exists"], 400);
        }

        $isAdmin = false;
        if (!empty($input['secret'])) {
            if ($input['secret'] === $adminSecret) { {
                    $isAdmin = true;
                }
            }
        }

        $statement = $pdo->prepare('INSERT INTO client (name, email, password, isAdmin) VALUES (:name, :email, :password, :isAdmin)');
        $statement->execute([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => password_hash($input['password'], PASSWORD_ARGON2ID),
            'isAdmin' => $isAdmin ? 1 : 0,
        ]);

        $statement = $pdo->prepare('INSERT INTO cart (clientId) VALUES (:clientId)');
        $statement->execute(['clientId' => $pdo->lastInsertId()]);

        sendResponse(["message" => "User created successfully"], 200);
    }
} elseif ($path[0] === 'login') {
    if ($requestMethod === 'POST') {
        // Debug session status before login
        // error_log("Pre-login Session ID: " . session_id());
        // error_log("Pre-login Session Data: " . print_r($_SESSION, true));
        // error_log("Received Cookies: " . print_r($_COOKIE, true));

        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['email']) || empty($input['password'])) {
            sendResponse(["error" => "Invalid data"], 400);
        }

        $statement = $pdo->prepare('SELECT * FROM client WHERE email = :email');
        $statement->execute(['email' => $input['email']]);
        $user = $statement->fetch();

        if (!$user || !password_verify($input['password'], $user['password'])) {
            sendResponse(["error" => "Invalid credentials"], 401);
        }

        // Regenerate session ID for security
        session_regenerate_id(true);

        // Store user data in session
        $_SESSION['client'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'address' => $user['address'],
            'isAdmin' => $user['isAdmin'] === 1,
        ];

        $statement = $pdo->prepare('SELECT * FROM cart WHERE clientId = :clientId');
        $statement->execute(['clientId' => $user['id']]);
        $cartRes = $statement->fetch();

        $_SESSION['cart'] = [
            'id' => $cartRes['id'],
            'status' => $cartRes['status'],
            'checkoutDate' => $cartRes['checkoutDate'],
        ];

        // Debug session after setting data
        // error_log("Post-login Session ID: " . session_id());
        // error_log("Post-login Session Data: " . print_r($_SESSION, true));
        // error_log("Set-Cookie Header: " . print_r(headers_list(), true));

        session_write_close();

        $redirectPath = $user['isAdmin'] ? "/admin" : "/";
        // Set session cookie with SameSite=None and Secure attributes explicitly (FINALLY!!)
        header('Set-Cookie: ' . session_name() . '=' . session_id() . '; SameSite=None; Secure; HttpOnly');

        sendResponse([
            "message" => "Login successful",
            "redirect" => $redirectPath,
        ], 200);
    }
} elseif ($path[0] === 'logout') {
    if ($requestMethod === 'POST') {
        // POST /logout
        session_destroy();
        sendResponse(["message" => "Logout successful"], 200);
    }
} elseif ($path[0] === 'profile' && $requestMethod === 'GET') {
    // GET /profile
    // error_log("Profile Request Headers: " . print_r(getallheaders(), true));
    // error_log("Profile Session ID: " . session_id());
    // error_log("Profile Session Data: " . print_r($_SESSION, true));
    // error_log("Profile Cookies: " . print_r($_COOKIE, true));

    if (!isset($_SESSION['client'])) {
        // error_log("No client data in session");
        sendResponse(["error" => "Unauthorized"], 401);
    }

    sendResponse([
        "name" => $_SESSION['client']['name'],
        "email" => $_SESSION['client']['email'],
        "isAdmin" => $_SESSION['client']['isAdmin'],
        "phone" => $_SESSION['client']['phone'],
        "address" => $_SESSION['client']['address'],
    ], 200);
} elseif ($path[0] === 'profile') {
    // Check authentication for all profile endpoints
    if (empty($_SESSION['client']) || empty($_SESSION['client']['id'])) {
        sendResponse(["error" => "You must be signed in to access this resource"], 401);
    }

    if ($requestMethod === 'GET') {
        // GET /profile
        sendResponse([
            "id" => $_SESSION['client']['id'],
            "name" => $_SESSION['client']['name'],
            "email" => $_SESSION['client']['email'],
            "isAdmin" => $_SESSION['client']['isAdmin'],
            "phone" => $_SESSION['client']['phone'],
            "address" => $_SESSION['client']['address'],
        ], 200);
    } elseif ($requestMethod === 'PUT') {
        // PUT /profile - Update profile
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input)) {
            sendResponse(["error" => "No data provided"], 400);
        }

        $allowedFields = ['name', 'phone', 'address'];
        $updateFields = [];
        $updateValues = [];

        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateFields[] = "$field = :$field";
                $updateValues[$field] = $input[$field];
            }
        }

        if (empty($updateFields)) {
            sendResponse(["error" => "No valid fields to update"], 400);
        }

        $updateValues['id'] = $_SESSION['client']['id'];

        try {
            $statement = $pdo->prepare('UPDATE client SET ' . implode(', ', $updateFields) . ' WHERE id = :id');
            $statement->execute($updateValues);

            // Update session data
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $_SESSION['client'][$field] = $input[$field];
                }
            }

            sendResponse([
                "message" => "Profile updated successfully",
                "profile" => [
                    "id" => $_SESSION['client']['id'],
                    "name" => $_SESSION['client']['name'],
                    "email" => $_SESSION['client']['email'],
                    "isAdmin" => $_SESSION['client']['isAdmin'],
                    "phone" => $_SESSION['client']['phone'],
                    "address" => $_SESSION['client']['address'],
                ]
            ], 200);
        } catch (Exception $e) {
            sendResponse(["error" => "Failed to update profile: " . $e->getMessage()], 500);
        }
    } elseif ($requestMethod === 'POST' && isset($path[1]) && $path[1] === 'password') {
        // POST /profile/password - Change password
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['currentPassword']) || empty($input['newPassword'])) {
            sendResponse(["error" => "Current password and new password are required"], 400);
        }

        // Verify current password
        $statement = $pdo->prepare('SELECT password FROM client WHERE id = :id');
        $statement->execute(['id' => $_SESSION['client']['id']]);
        $user = $statement->fetch();

        if (!password_verify($input['currentPassword'], $user['password'])) {
            sendResponse(["error" => "Current password is incorrect"], 400);
        }

        // Update password
        $hashedPassword = password_hash($input['newPassword'], PASSWORD_ARGON2ID);
        $statement = $pdo->prepare('UPDATE client SET password = :password WHERE id = :id');
        $statement->execute([
            'password' => $hashedPassword,
            'id' => $_SESSION['client']['id']
        ]);

        sendResponse(["message" => "Password updated successfully"], 200);
    }
} elseif ($path[0] === 'orders') {

    validateAuth();

    $clientId = $_SESSION['client']['id'];

    if ($requestMethod === 'GET') {
        if (isset($path[1])) {
            // GET /orders/{id} - Get specific order
            $orderId = (int)$path[1];

            // Check if order belongs to the authenticated user (or is admin)
            $statement = $pdo->prepare('SELECT * FROM orders WHERE id = :orderId AND clientId = :clientId');
            $statement->execute(['orderId' => $orderId, 'clientId' => $clientId]);
            $order = $statement->fetch();

            if (!$order) {
                sendResponse(["error" => "Order not found"], 404);
            }

            // Get order items with product details
            $statement = $pdo->prepare('
                SELECT oi.*, p.name, p.brand, pi.url as thumbnail 
                FROM orderitem oi 
                INNER JOIN product p ON oi.productId = p.id 
                LEFT JOIN productimage pi ON p.id = pi.productId AND pi.isThumbnail = 1
                WHERE oi.orderId = :orderId
            ');
            $statement->execute(['orderId' => $orderId]);
            $orderItems = $statement->fetchAll();

            $order['items'] = $orderItems;
            sendResponse($order);
        } else {
            // GET /orders - Get all orders for authenticated user
            $statement = $pdo->prepare('SELECT * FROM orders WHERE clientId = :clientId ORDER BY orderDate DESC');
            $statement->execute(['clientId' => $clientId]);
            $orders = $statement->fetchAll();

            // Get order items for each order
            foreach ($orders as &$order) {
                $statement = $pdo->prepare('
                    SELECT oi.*, p.name, p.brand, pi.url as thumbnail 
                    FROM orderitem oi 
                    INNER JOIN product p ON oi.productId = p.id 
                    LEFT JOIN productimage pi ON p.id = pi.productId AND pi.isThumbnail = 1
                    WHERE oi.orderId = :orderId
                ');
                $statement->execute(['orderId' => $order['id']]);
                $order['items'] = $statement->fetchAll();
            }

            sendResponse($orders);
        }
    } elseif ($requestMethod === 'POST') {
        // POST /orders - Create new order from cart
        $input = json_decode(file_get_contents('php://input'), true);

        // Get user's active cart
        $statement = $pdo->prepare('SELECT * FROM cart WHERE clientId = :clientId AND status = "active"');
        $statement->execute(['clientId' => $clientId]);
        $cart = $statement->fetch();

        if (!$cart) {
            sendResponse(["error" => "No active cart found"], 400);
        }

        // Get cart items
        $statement = $pdo->prepare('
            SELECT ci.*, p.price, p.stock, p.name 
            FROM cartitem ci 
            INNER JOIN product p ON ci.productId = p.id 
            WHERE ci.cartId = :cartId
        ');
        $statement->execute(['cartId' => $cart['id']]);
        $cartItems = $statement->fetchAll();

        if (empty($cartItems)) {
            sendResponse(["error" => "Cart is empty"], 400);
        }

        // Calculate total amount and check stock
        $totalAmount = 0;
        foreach ($cartItems as $item) {
            if ($item['quantity'] > $item['stock']) {
                sendResponse(["error" => "Insufficient stock for " . $item['name']], 400);
            }
            $totalAmount += ($item['price'] * $item['quantity']);
        }

        // Apply any discount if provided
        if (isset($input['discountPercent']) && $input['discountPercent'] > 0) {
            $totalAmount = $totalAmount * (1 - $input['discountPercent'] / 100);
        }

        try {
            $pdo->beginTransaction();

            // Create order
            $statement = $pdo->prepare('
                INSERT INTO orders (clientId, orderDate, totalAmount, status) 
                VALUES (:clientId, :orderDate, :totalAmount, :status)
            ');
            $statement->execute([
                'clientId' => $clientId,
                'orderDate' => date('Y-m-d H:i:s'),
                'totalAmount' => $totalAmount,
                'status' => 'pending'
            ]);

            $orderId = $pdo->lastInsertId();

            // Create order items and update product stock
            foreach ($cartItems as $item) {
                // Insert order item
                $statement = $pdo->prepare('
                    INSERT INTO orderitem (productId, orderId, quantity, price) 
                    VALUES (:productId, :orderId, :quantity, :price)
                ');
                $statement->execute([
                    'productId' => $item['productId'],
                    'orderId' => $orderId,
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);

                // Update product stock
                $statement = $pdo->prepare('
                    UPDATE product 
                    SET stock = stock - :quantity 
                    WHERE id = :productId
                ');
                $statement->execute([
                    'quantity' => $item['quantity'],
                    'productId' => $item['productId']
                ]);
            }

            // Clear cart
            $statement = $pdo->prepare('DELETE FROM cartitem WHERE cartId = :cartId');
            $statement->execute(['cartId' => $cart['id']]);

            // Update cart status
            $statement = $pdo->prepare('
                UPDATE cart 
                SET status = "completed", checkoutDate = :checkoutDate 
                WHERE id = :cartId
            ');
            $statement->execute([
                'checkoutDate' => date('Y-m-d H:i:s'),
                'cartId' => $cart['id']
            ]);

            // Create new active cart for user
            $statement = $pdo->prepare('INSERT INTO cart (status, clientId) VALUES ("active", :clientId)');
            $statement->execute(['clientId' => $clientId]);
            $newCartId = $pdo->lastInsertId();

            // Update session with new cart
            $_SESSION['cart']['id'] = $newCartId;

            $pdo->commit();

            sendResponse([
                "message" => "Order created successfully",
                "orderId" => $orderId,
                "totalAmount" => $totalAmount
            ], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(["error" => "Failed to create order: " . $e->getMessage()], 500);
        }
    } elseif ($requestMethod === 'PUT') {
        // PUT /orders/{id} - Cancel order
        if (!isset($path[1])) {
            sendResponse(["error" => "Order ID required"], 400);
        }

        $orderId = (int)$path[1];

        // Get order details
        $statement = $pdo->prepare('SELECT * FROM orders WHERE id = :orderId AND clientId = :clientId');
        $statement->execute(['orderId' => $orderId, 'clientId' => $clientId]);
        $order = $statement->fetch();

        if (!$order) {
            sendResponse(["error" => "Order not found"], 404);
        }

        if ($order['status'] === 'cancelled') {
            sendResponse(["error" => "Order is already cancelled"], 400);
        }

        if ($order['status'] === 'completed' || $order['status'] === 'shipped') {
            sendResponse(["error" => "Cannot cancel order with status: " . $order['status']], 400);
        }

        try {
            $pdo->beginTransaction();

            // Get order items to restore stock
            $statement = $pdo->prepare('SELECT * FROM orderitem WHERE orderId = :orderId');
            $statement->execute(['orderId' => $orderId]);
            $orderItems = $statement->fetchAll();

            // Restore product stock
            foreach ($orderItems as $item) {
                $statement = $pdo->prepare('
                    UPDATE product 
                    SET stock = stock + :quantity 
                    WHERE id = :productId
                ');
                $statement->execute([
                    'quantity' => $item['quantity'],
                    'productId' => $item['productId']
                ]);
            }

            // Update order status
            $statement = $pdo->prepare('UPDATE orders SET status = "cancelled" WHERE id = :orderId');
            $statement->execute(['orderId' => $orderId]);

            $pdo->commit();

            sendResponse(["message" => "Order cancelled successfully"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(["error" => "Failed to cancel order: " . $e->getMessage()], 500);
        }
    }
} else {
    sendResponse(["error" => "Not found"], 404);
}


/**
 * Validates if the user is authenticated.
 * If $requireAuth is true, it checks if the user is logged in.
 * If not logged in, it sends a 401 Unauthorized response.
 *
 * @param bool $requireAuth Whether authentication is required
 */
function validateAuth($requireAuth = true)
{
    if ($requireAuth && (empty($_SESSION['client']) || empty($_SESSION['client']['id']))) {
        sendResponse(["error" => "You must be signed in to access this resource"], 401);
    }
}
