<?php
session_start();
ini_set('session.cookie_path', '/');
header('Content-Type: application/json');

$servername = "db";  
$username = "root";       
$password = "root";     
$dbname = "boothera"; 

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$action = $_POST['action'] ?? '';
$email = $_POST['email'] ?? '';
$email = mysqli_real_escape_string($conn, $email);

// 功能 1：生成并发送验证码
if ($action === 'send_code') {
    $sql = "SELECT * FROM Users WHERE `e-mail` = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "❌ Email not found!"]);
        exit;
    }

    $code = strval(rand(100000, 999999));
    $_SESSION['reset_code'] = $code;
    $_SESSION['reset_email'] = $email;
    $_SESSION['reset_code_time'] = time();

    echo json_encode(["success" => true, "code" => $code]);
    exit;
}

// 功能 2：校验验证码并修改密码
if ($action === 'reset_password') {
    $input_code = $_POST['code'] ?? '';
    $new_password = $_POST['password'] ?? '';

    if (!isset($_SESSION['reset_code']) || $_SESSION['reset_email'] !== $email) {
        echo json_encode(["success" => false, "message" => "❌ Please get a verification code first!"]);
        exit;
    }

    if ($input_code !== $_SESSION['reset_code']) {
        echo json_encode(["success" => false, "message" => "❌ Invalid verification code!"]);
        exit;
    }

    if (time() - $_SESSION['reset_code_time'] > 300) {
        echo json_encode(["success" => false, "message" => "❌ Code expired!"]);
        exit;
    }

    $new_password = mysqli_real_escape_string($conn, $new_password);
    $update_sql = "UPDATE Users SET `password` = '$new_password' WHERE `e-mail` = '$email'";

    if ($conn->query($update_sql) === TRUE) {
        unset($_SESSION['reset_code']);
        unset($_SESSION['reset_email']);
        unset($_SESSION['reset_code_time']);
        echo json_encode(["success" => true, "message" => "🎉 Password reset successful!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
    }
    exit;
}

$conn->close();
?>