<?php
error_reporting(0); // 必须加上：屏蔽所有警告，防止破坏 JSON
ini_set('display_errors', 0);

session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

// --- 第一步：先获取 $uid ---
$uid = $_GET['uid'] ?? $_POST['uid'] ?? $_SESSION['user_id'] ?? null;

// --- 第二步：再进行所有检查 ---
// 1. 登录检查
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Please login first!"]);
    exit;
}

// 2. 权限安全校验 (放在 $uid 赋值之后！)
// 假设你的 session 中存了 userRole，没有的话请先检查是否存在
$userRole = $_SESSION['userRole'] ?? ''; 
if ($uid != $_SESSION['user_id'] && $userRole !== 'admin') {
    echo json_encode(["success" => false, "message" => "You are not authorized to access this resource."]);
    exit;
}

// 3. 基础有效性检查
if (!$uid) {
    echo json_encode(["success" => false, "message" => "No valid user ID provided."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ==========================================================
// 处理 GET 请求：读取个人资料
// ==========================================================
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'get_profile') {
        // 使用 user_id 进行查询，确保数据隔离
        $sql = "SELECT name AS username, phone_number AS phone, `e-mail` AS email, business_name 
                FROM Users WHERE user_id = ? LIMIT 1";
        
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                echo json_encode([
                    "success" => true,
                    "data" => $user
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "User data not found."]);
            }
            $stmt->close();
        } else {
            echo json_encode(["success" => false, "message" => "Failed to prepare database query."]);
        }
        exit;
    }
}

// ==========================================================
// 处理 POST 请求：更新个人资料
// ==========================================================
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $username = trim($_POST['username'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $business_name = trim($_POST['business_name'] ?? '');

        // 使用 user_id 进行更新，而非依赖前端传回的 email
        $sql = "UPDATE Users 
                SET name = ?, phone_number = ?, business_name = ? 
                WHERE user_id = ?";
        
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("sssi", $username, $phone, $business_name, $uid);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Profile updated successfully."
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update profile in the database."]);
            }
            $stmt->close();
        } else {
            echo json_encode(["success" => false, "message" => "Failed to prepare database update query."]);
        }
        exit;
    }
}

echo json_encode(["success" => false, "message" => "Invalid request."]);
$conn->close();
?>