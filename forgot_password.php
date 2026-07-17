<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

// 引入连接文件，如果连接失败，它会直接处理报错并退出
require_once 'db.php'; 

$action = $_POST['action'] ?? '';

// 功能 1：点击 Get Code
if ($action === 'send_code') {
    $email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
    
    // 检查邮箱是否存在
    $check = $conn->query("SELECT * FROM Users WHERE `e-mail` = '$email'");
    if ($check && $check->num_rows > 0) {
        $code = strval(rand(100000, 999999));
        $_SESSION['reset_code'] = $code;
        $_SESSION['reset_email'] = $email;
        echo json_encode(["success" => true, "code" => $code]);
    } else {
        echo json_encode(["success" => false, "message" => "邮箱地址不存在！"]);
    }
    exit;
}

// 功能 2：点击 Reset Password
if ($action === 'reset_password') {
    $input_code = $_POST['code'] ?? '';
    $new_pass = $_POST['password'] ?? '';

    if (isset($_SESSION['reset_code']) && $input_code === $_SESSION['reset_code']) {
        $email = $_SESSION['reset_email'];
        $hashed_pass = password_hash($new_pass, PASSWORD_DEFAULT);
        
        $sql = "UPDATE Users SET password = '$hashed_pass' WHERE `e-mail` = '$email'";
        if ($conn->query($sql)) {
            unset($_SESSION['reset_code'], $_SESSION['reset_email']);
            echo json_encode(["success" => true, "message" => "密码修改成功！"]);
        } else {
            echo json_encode(["success" => false, "message" => "数据库更新失败"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "验证码错误！"]);
    }
    exit;
}
?>