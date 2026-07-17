<?php
// ==========================================================
// 4. profile.php - 用户资料管理 API (已修正为 mysqli 稳定版)
// ==========================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 引入你的数据库连接文件（提供 $conn 对象）
require_once 'db.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// ==========================================================
// 处理 GET 请求：读取个人资料
// ==========================================================
if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $email = isset($_GET['email']) ? trim($_GET['email']) : '';

    if ($action === 'get_profile') {
        if (empty($email)) {
            echo json_encode(["success" => false, "message" => "邮箱不能为空！"]);
            exit;
        }

        // 使用 mysqli 预处理（用 ? 代替 :email）
        $sql = "SELECT name AS username, phone_number AS phone, `e-mail` AS email, business_name, password 
            FROM Users 
            WHERE `e-mail` = ? LIMIT 1";
        
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                echo json_encode([
                    "success" => true,
                    "data" => $user
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "未找到该用户的数据。"]);
            }
            $stmt->close();
        } else {
            echo json_encode(["success" => false, "message" => "数据库查询准备失败: " . $conn->error]);
        }
        exit;
}

// ==========================================================
// 处理 POST 请求：更新个人资料
// ==========================================================
if ($method === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $old_email = isset($_POST['old_email']) ? trim($_POST['old_email']) : '';
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $business_name = isset($_POST['business_name']) ? trim($_POST['business_name']) : '';

    if ($action === 'update_profile') {
        if (empty($old_email)) {
            echo json_encode(["success" => false, "message" => "当前登录状态异常，缺少标识邮箱！"]);
            exit;
        }

        // 使用 mysqli 预处理更新语句
        $sql = "UPDATE Users 
                SET name = ?, phone_number = ?, business_name = ? 
                WHERE `e-mail` = ?";
        
        if ($stmt = $conn->prepare($sql)) {
            // "ssss" 代表四个参数都是 string 字符串类型
            $stmt->bind_param("ssss", $username, $phone, $business_name, $old_email);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "个人资料保存成功！"
                ]);
            } else {
                echo json_encode(["success" => false, "message" => "数据库更新执行失败: " . $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(["success" => false, "message" => "数据库更新准备失败: " . $conn->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "无效的 POST 动作。"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "不支持的请求方式。"]);
$conn->close();
?>