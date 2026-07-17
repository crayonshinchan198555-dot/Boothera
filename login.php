<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

// 1. 获取输入数据前，先确保它们存在 (使用 ?? 处理)
$email = mysqli_real_escape_string($conn, $_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// 2. 初始化变量，防止警告
$row = null;

// 3. 查询数据库
$sql = "SELECT password, role FROM Users WHERE `e-mail` = '$email'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // 4. 检查 $row 是否有值，再进行判断
    if ($row && $password === $row['password']) {
        $_SESSION['user_email'] = $email;
        
        $target = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';
        
        echo json_encode([
            "success" => true, 
            "message" => "登录成功", 
            "redirect" => $target
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "密码错误"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "用户不存在"]);
}
exit;
?>