<?php
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'] ?? '';
    $phone_number = $_POST['phone_number'] ?? '';
    $email = $_POST['e-mail'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'user';
    $business_name = $_POST['business_name'] ?? null;

    // --- 修改部分开始 ---
    
    // 1. 使用 password_hash 对密码进行加密
    $password_to_save = password_hash($password, PASSWORD_DEFAULT);
    // 确保这里的字段名与数据库完全一致（请再次确认数据库里到底是 e-mail 还是 email）
    $stmt =$conn->prepare("INSERT INTO Users (name, phone_number, `e-mail`, password, role, business_name) VALUES (?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "SQL preparation error: " . $conn->error]);
        exit();
    }

    // 将原本的 $hashed_password 改为 $password_to_save
    $stmt->bind_param("ssssss", $name, $phone_number, $email, $password_to_save, $role, $business_name);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registration successful!", "redirect" => "../index.html"]);
    } else {
        echo json_encode(["success" => false, "message" => "Execution error: " . $stmt->error]);
    }
// ... 前面的代码 ...
    $stmt->close();
} else {
    // 这里是唯一的一个 else，对应最外层的 if ($_SERVER["REQUEST_METHOD"] == "POST")
    echo json_encode([
        "success" => false, 
        "message" => "Only POST requests are supported",
        "method_received" => $_SERVER["REQUEST_METHOD"],
        "uri" => $_SERVER["REQUEST_URI"]
    ]);
}
$conn->close();
exit();
?>