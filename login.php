<?php
session_start();
require_once 'db.php'; // 确保这里连接的是你正确的数据库

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 假设前端表单的 name 属性为 email 和 password
    $email = $_POST['email']; 
    $password = $_POST['password'];

    // 使用 email 进行查询，因为图片中显示 email 是唯一的标识
    $sql = "SELECT user_id, password, role FROM Users WHERE `e-mail` = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // 由于你的数据库存储的是明文，直接比较字符串
        if ($password === $user['password']) {
            $_SESSION['user_id'] = $user['user_id'];
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