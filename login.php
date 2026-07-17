<?php
session_start();
require_once 'db.php'; // 引入你的数据库连接文件

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // 假设你的用户表名为 users，列名为 username, password, role
    $sql = "SELECT id, password, role FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // 验证密码 (建议使用 password_verify，如果你的密码是加密存储的)
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];

            // 根据 role 执行跳转
            if ($user['role'] === 'admin') {
                header("Location: adminpages/home.php");
            } else {
                header("Location: user_pages/user.php");
            }
            exit();
        } else {
            echo "密码错误";
        }
    } else {
        echo "用户不存在";
    }
    $stmt->close();
}
?>