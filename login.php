<?php
session_start();
// 💡 加这一行：关闭报错显示，防止 Warning/Notice 破坏 JSON 格式
ini_set('display_errors', 0);
error_reporting(0);

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 


// 确认你的 db.php 里面定义了 $conn。
// 如果 db.php 里写的是别的变量名（比如 $mysqli），请在这里统一修改.


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