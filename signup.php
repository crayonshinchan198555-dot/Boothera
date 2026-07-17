<?php
// 1. 确保你的数据库连接配置依然正确（Docker 内部互相通信模式）
require_once 'db.php';

$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接是否成功
// 修改 signup.php 的这一部分：
if ($conn->query($sql) === TRUE) {
    // 设置响应头为 JSON
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "success" => true,
        "message" => "注册成功！即将跳转到登录页面...",
        "redirect" => "login.html" // 假设你的登录页是 login.html
    ]);
} else {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "success" => false,
        "message" => "注册失败: " . $conn->error
    ]);
}

// 2. 接收来自 HTML 表单提交的数据 (对接你 HTML 的 name 属性)
$name = $_POST['name'] ?? '';
$phone_number = $_POST['phone_number'] ?? ''; 
$email = $_POST['email'] ?? '';                     
$password = $_POST['password'] ?? '';               
$role = $_POST['role'] ?? 'user';             
$business_name = $_POST['business_name'] ?? null;

// 在 $sql 语句之前添加这行：
$hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);

// 然后在 SQL 中使用 $hashed_password 而不是 $password
$sql = "INSERT INTO Users (name, phone_number, `e-mail`, password, role, business_name) 
        VALUES ('$name', '$phone_number', '$email', '$hashed_password', '$role', '$business_name')";, '$business_name')";

// 👇 👇 👇 核心修改在这里 👇 👇 👇
if ($conn->query($sql) === TRUE) {
    // 💡 替换掉了原本冰冷的 echo "注册成功！";
    echo "<!DOCTYPE html>
    <html lang='zh-CN'>
    <head>
        <meta charset='UTF-8'>
        <title>注册成功 - BoothEra</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f6;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .success-container {
                background-color: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                text-align: center;
                border-top: 5px solid #2ecc71; /* 成功绿 */
                width: 350px;
            }
            .success-icon {
                font-size: 60px;
                color: #2ecc71;
                margin-bottom: 15px;
            }
            .success-title {
                color: #333;
                font-size: 24px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            .success-message {
                color: #666;
                font-size: 14px;
                margin-bottom: 5px;
            }
        </style>
        <!-- 页面 1.5 秒后自动跳转到登录页（index.html 在当前 src 目录下，所以直接写 index.html 即可） -->
        <meta http-equiv='refresh' content='1.5;url=index.html'>
    </head>
    <body>
        <div class='success-container'>
            <div class='success-icon'>✓</div>
            <div class='success-title'>注册成功！</div>
            <div class='success-message'>感谢加入 BoothEra</div>
            <div class='success-message' style='color: #aaa;'>正在为你跳转到登录页...</div>
        </div>
    </body>
    </html>";
    exit; // 确保输出美化页面后立即停止后面代码执行
} else {
    echo "错误: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>