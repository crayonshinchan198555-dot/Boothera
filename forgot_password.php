<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php'; 

$action = $_POST['action'] ?? '';

if ($action === 'send_code') {
    $email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
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

if ($action === 'reset_password') {
    $input_code = $_POST['code'] ?? '';
    $new_pass = $_POST['password'] ?? ''; // 直接获取明文密码

    if (isset($_SESSION['reset_code']) && $input_code === $_SESSION['reset_code']) {
        $email = $_SESSION['reset_email'];
        
        // 【关键修改】：不使用 password_hash，直接存明文
        $sql = "UPDATE Users SET password = '$new_pass' WHERE `e-mail` = '$email'";
        
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