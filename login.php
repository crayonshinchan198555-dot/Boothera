<?php
session_start();
header('Content-Type: application/json');

// 直接使用你现有的 db.php，只要它能正常工作，这里就一定能连接
require_once 'db.php'; 

$action = $_POST['action'] ?? '';

// 1. 生成验证码
if ($action === 'send_code') {
    $code = strval(rand(100000, 999999));
    $_SESSION['reset_code'] = $code;
    
    // 直接返回，前端 Alert 出来
    echo json_encode(["success" => true, "code" => $code]);
    exit;
}

// 2. 验证并改密码
if ($action === 'reset_password') {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $input_code = $_POST['code'] ?? '';
    $new_pass = $_POST['password'] ?? '';

    // 匹配验证码
    if ($input_code === $_SESSION['reset_code']) {
        // 更新密码 (记得用 password_hash，别用明文存)
        $hashed_pass = password_hash($new_pass, PASSWORD_DEFAULT);
        $conn->query("UPDATE Users SET password = '$hashed_pass' WHERE `e-mail` = '$email'");
        
        echo json_encode(["success" => true, "message" => "密码修改成功！"]);
    } else {
        echo json_encode(["success" => false, "message" => "验证码错误！"]);
    }
    exit;
}
?>