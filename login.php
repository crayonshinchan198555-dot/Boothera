<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

// 【核心修改】：不依赖 $_POST，直接从原始输入流读取
$rawInput = file_get_contents("php://input");
parse_str($rawInput, $data);

// 提取数据
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// 如果此时还报空，说明前端根本没发出 body
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "后端没收到 Email，原始请求内容: " . $rawInput]);
    exit;
}

// 接下来执行你原本的数据库逻辑
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