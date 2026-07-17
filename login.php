<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

// 接收数据
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// 如果收到数据，打印出来看看（调试用）
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "后端没收到 Email"]);
    exit;
}

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
?>