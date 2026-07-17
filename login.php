<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

$email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// 1. 查询用户
$sql = "SELECT password FROM Users WHERE `e-mail` = '$email'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // 【关键】：这里直接对比明文密码
    if ($password === $row['password']) {
        $_SESSION['user_email'] = $email;
        echo json_encode(["success" => true, "message" => "登录成功"]);
    } else {
        echo json_encode(["success" => false, "message" => "密码错误"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "用户不存在"]);
}
?>