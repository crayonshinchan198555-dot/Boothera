<?php
// 1. 最优先启动 Session
session_start();

// 2. 然后再处理报错和 Header
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=UTF-8');

// 3. 数据库连接
$host = 'hayabusa.proxy.rlwy.net';
$user = '...'; 
$pass = '...';
$db   = '...';
$port = 59703;

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "数据库连接失败"]);
    exit;
}

// 4. 处理逻辑
$action = $_POST['action'] ?? '';

// 功能 1：点击 Get Code
if ($action === 'send_code') {
    $code = strval(rand(100000, 999999));
    $_SESSION['reset_code'] = $code;
    
    // 直接返回 code 给前端，前端会弹窗显示
    echo json_encode(["success" => true, "code" => $code]);
    exit;
}

// 功能 2：点击 Reset Password
if ($action === 'reset_password') {
    $email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
    $input_code = $_POST['code'] ?? '';
    $new_pass = $_POST['password'] ?? '';

    // 校验 Session 中的验证码
    if (isset($_SESSION['reset_code']) && $input_code === $_SESSION['reset_code']) {
        // 使用 password_hash 加密存入数据库
        $hashed_pass = password_hash($new_pass, PASSWORD_DEFAULT);
        
        $sql = "UPDATE Users SET password = '$hashed_pass' WHERE `e-mail` = '$email'";
        if ($conn->query($sql)) {
            unset($_SESSION['reset_code']); // 成功后清除验证码
            echo json_encode(["success" => true, "message" => "密码修改成功！"]);
        } else {
            echo json_encode(["success" => false, "message" => "数据库更新失败"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "验证码错误或已过期！"]);
    }
    exit;
}
?>