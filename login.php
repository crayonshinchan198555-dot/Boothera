<?php
session_start();
// 关闭报错显示，防止 JSON 格式被破坏
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $email = mysqli_real_escape_string($conn, $email);
    $sql = "SELECT * FROM Users WHERE `e-mail` = '$email'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        if (password_verify($password, $row['password']) || $password == $row['password']) {
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['userRole'] = $row['role']; 

            // --- 修改部分：根据角色决定跳转路径 ---
            // 注意：请确保你的数据库中 admin 的角色值确实是 'admin'
            $redirectUrl = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';

            echo json_encode([
                "success" => true, 
                "message" => "登录成功",
                "redirect" => $redirectUrl // 返回跳转地址
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "密码错误"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "用户不存在"]);
    }
}
$conn->close();
?>