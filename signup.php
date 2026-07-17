<?php
// 在顶部添加：
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ... 其余代码 ...

// 2. 设置响应头为 JSON
header("Content-Type: application/json; charset=UTF-8");

// 3. 引入数据库连接
require_once 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'user';
    $business_name = $_POST['business_name'] ?? null;

    // 密码加密（一定要做）
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 使用准备好的语句插入，防止 SQL 注入（这是更好的习惯）
    $stmt = $conn->prepare("INSERT INTO Users (name, phone_number, `e-mail`, password, role, business_name) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $name, $phone_number, $email, $hashed_password, $role, $business_name);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "注册成功！", "redirect" => "../index.html"]);
    } else {
        echo json_encode(["success" => false, "message" => "数据库插入失败: " . $conn->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "请求方法错误"]);
}
$conn->close();
?>