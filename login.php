<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // 使用预处理语句
    $stmt = $conn->prepare("SELECT user_id, password, role FROM Users WHERE `e-mail` = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // 验证逻辑：支持哈希验证 或 旧的明文验证
        if (password_verify($password, $row['password']) || $password === $row['password']) {
            
            // 如果是明文，可以在这里执行一次自动升级（可选）
            if ($password === $row['password'] && !password_needs_rehash($row['password'], PASSWORD_DEFAULT)) {
                // 这里可以执行 SQL UPDATE 将新哈希值存回数据库
            }

            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['userRole'] = $row['role']; 

            $redirectUrl = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';

            echo json_encode([
                "success" => true, 
                "message" => "登录成功",
                "redirect" => $redirectUrl
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "密码错误"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "用户不存在"]);
    }
    $stmt->close();
}
$conn->close();
?>