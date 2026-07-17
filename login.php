<?php
session_start();
header("Content-Type: application/json; charset=UTF-8"); // 必须强制声明返回 JSON

// 数据库连接部分保持不变...
// 假设 $conn 已正确定义

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

            // 成功：只返回这个 JSON
            echo json_encode(["success" => true, "message" => "登录成功"]);
        } else {
            echo json_encode(["success" => false, "message" => "密码错误"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "用户不存在"]);
    }
}
$conn->close();
?>