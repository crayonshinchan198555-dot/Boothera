<?php
file_put_contents('debug.log', "POST数据: " . print_r($_POST, true) . PHP_EOL, FILE_APPEND);
// ... 保持原来的代码 ...
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

// 只用最原始的方式获取，不要 parse_str，不要 file_get_contents
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// 如果这里直接报空，说明 JS 发送有问题，我们先看数据库查询
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "后端未收到数据 (Email为空)"]);
    exit;
}

// 严谨的查询
$stmt = $conn->prepare("SELECT `password`, `role` FROM `Users` WHERE `e-mail` = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if ($password === $row['password']) {
        $_SESSION['user_email'] = $email;
        $target = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';
        echo json_encode(["success" => true, "message" => "登录成功", "redirect" => $target]);
    } else {
        echo json_encode(["success" => false, "message" => "密码错误"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "用户不存在"]);
}
$stmt->close();
exit;
?>