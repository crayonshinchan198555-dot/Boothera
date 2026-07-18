<?php
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; // 确保你的数据库连接文件名字正确

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';
    $new_password = $_POST['password'] ?? '';

    if (empty($email) || empty($new_password)) {
        echo json_encode(["success" => false, "message" => "参数缺失"]);
        exit();
    }

    // 更新用户密码 (这里没有 hash，因为你之前移除了 hash 逻辑)
    // 如果以后想加回安全机制，记得在这里使用 password_hash()
    $stmt = $conn->prepare("UPDATE Users SET password = ? WHERE `e-mail` = ?");
    $stmt->bind_param("ss", $new_password, $email);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "密码重置成功"]);
        } else {
            echo json_encode(["success" => false, "message" => "邮箱不存在或密码未修改"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "数据库错误"]);
    }

    $stmt->close();
}
$conn->close();
?>