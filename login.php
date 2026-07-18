<?php
session_start();
session_regenerate_id(true); // 这一行会销毁旧 Session 并生成新 ID，防止劫持或缓存冲突
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. 获取并清理输入（防止多余空格干扰）
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "邮箱和密码不能为空"]);
        exit;
    }

    // 2. 使用预处理语句查询用户
    $stmt = $conn->prepare("SELECT user_id, password, role FROM Users WHERE `e-mail` = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $dbPassword = $row['password'];

        // 3. 验证逻辑：优先哈希验证，其次明文对比
        $isHashValid = password_verify($password, $dbPassword);
        $isPlainTextValid = ($password === $dbPassword);

        if ($isHashValid || $isPlainTextValid) {
            
            // 如果是明文登录，考虑自动升级到哈希存储（增强安全性）
            if ($isPlainTextValid) {
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $updateStmt = $conn->prepare("UPDATE Users SET password = ? WHERE user_id = ?");
                $updateStmt->bind_param("si", $newHash, $row['user_id']);
                $updateStmt->execute();
                $updateStmt->close();
            }

            // 4. 设置 Session
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['userRole'] = $row['role']; 

            // 5. 根据角色定义跳转路径
            $redirectUrl = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';

            echo json_encode([
                "success" => true, 
                "message" => "登录成功",
                "redirect" => $redirectUrl
            ]);
        } else {
            // 调试用：如果登录失败，可以在 Response 中看到具体对比情况
            echo json_encode([
                "success" => false, 
                "message" => "密码错误",
                "debug" => "输入验证失败" // 在生产环境中请移除此调试信息
            ]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "用户不存在"]);
    }
    $stmt->close();
}
$conn->close();
?>