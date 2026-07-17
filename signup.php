<?php
// 1. 关闭直接显示错误，改用错误日志记录
ini_set('display_errors', 0); 
error_reporting(E_ALL);

// 2. 设置 JSON 头
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';
    $email = $_POST['e-mail'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'user';
    $business_name = $_POST['business_name'] ?? null;

    // 密码加密（一定要做）
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 使用准备好的语句插入，防止 SQL 注入（这是更好的习惯）
   $stmt =$conn->prepare("INSERT INTO Users (name, phone_number, `e-mail`, password, role, business_name) VALUES (?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        // 如果预处理失败，返回详细错误而不破坏 JSON
        echo json_encode(["success" => false, "message" => "SQL准备失败: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("ssssss", $name, $phone_number, $email, $hashed_password, $role, $business_name);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "注册成功！", "redirect" => "../index.html"]);
    } else {
        echo json_encode(["success" => false, "message" => "数据库插入失败: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "请求方法错误"]);
}
$conn->close();
exit(); // 确保脚本执行完毕后立刻终止，防止后面有空格或其他输出
?>