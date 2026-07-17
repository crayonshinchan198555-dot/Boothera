<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

// --- 最强接收方案 ---
// 1. 优先尝试 $_POST
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// 2. 如果 $_POST 为空，强制读取 raw body 并解析
if (empty($email)) {
    $raw_input = file_get_contents("php://input");
    parse_str($raw_input, $data);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
}

// 3. 统一清理
$email = trim($email); 
$email = mysqli_real_escape_string($conn, $email);

// --- 调试：如果还是空，直接在前端报错停止 ---
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "错误：PHP 未接收到任何 Email 数据，请检查前端 JS 发送格式。"]);
    exit;
}

// --- 数据库查询 ---
$sql = "SELECT `password`, `role` FROM `Users` WHERE `e-mail` = '$email'";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "message" => "SQL错误: " . $conn->error]);
    exit;
}

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($password === $row['password']) {
        $_SESSION['user_email'] = $email;
        $target = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';
        echo json_encode(["success" => true, "message" => "登录成功", "redirect" => $target]);
    } else {
        echo json_encode(["success" => false, "message" => "密码错误"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "用户不存在。查询邮箱: [" . $email . "]"]);
}
exit;
?>