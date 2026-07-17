<?php
// 确保文件第一行就是 <?php，前面没有任何空格、换行或 BOM 符号
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 使用 null coalescing 操作符，防止报错
    $name =$_POST['name'] ?? '';
    $phone_number =$_POST['phone_number'] ?? '';
    $email =$_POST['e-mail'] ?? '';
    $password =$_POST['password'] ?? '';
    $role =$_POST['role'] ?? 'user';
    $business_name =$_POST['business_name'] ?? null;

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 确保这里的字段名与数据库完全一致（请再次确认数据库里到底是 e-mail 还是 email）
    $stmt =$conn->prepare("INSERT INTO Users (name, phone_number, `e-mail`, password, role, business_name) VALUES (?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "SQL准备错误: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("ssssss", $name, $phone_number, $email, $hashed_password, $role, $business_name);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "注册成功！", "redirect" => "../index.html"]);
    } else {
        echo json_encode(["success" => false, "message" => "执行错误: " . $stmt->error]);
    }
// ... 前面的代码 ...
    $stmt->close();
} else {
    // 这里是唯一的一个 else，对应最外层的 if ($_SERVER["REQUEST_METHOD"] == "POST")
    echo json_encode([
        "success" => false, 
        "message" => "仅支持POST请求",
        "method_received" => $_SERVER["REQUEST_METHOD"],
        "uri" => $_SERVER["REQUEST_URI"]
    ]);
}
$conn->close();
exit();
?>