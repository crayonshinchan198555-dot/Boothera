<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'db.php';

// 1. 获取并清理输入数据 (增加 trim()，强制去掉你输入时可能不小心带上的隐藏空格)
$raw_email = $_POST['email'] ?? '';
$email = mysqli_real_escape_string($conn, trim($raw_email));
$password = $_POST['password'] ?? '';

// 如果连不上数据库，直接在前端报错
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "数据库连接失败: " . $conn->connect_error]);
    exit;
}

$row = null;

// 2. 查询数据库 (反引号包围特殊列名)
$sql = "SELECT `password`, `role` FROM `Users` WHERE `e-mail` = '$email'";
$result = $conn->query($sql);

// 3. 如果 SQL 语句执行失败（比如表名写错），直接把数据库的原始报错发给前端
if (!$result) {
    echo json_encode([
        "success" => false, 
        "message" => "SQL执行报错: " . $conn->error . " | 发送的SQL: " . $sql
    ]);
    exit;
}

// 4. 判断并处理结果
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    // 检查密码 (明文对比)
    if ($row && $password === $row['password']) {
        $_SESSION['user_email'] = $email;
        
        // 根据角色设置跳转路径
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
    // 【关键调试点】：如果找不到用户，把真正查询的邮箱加上括号显示出来！
    // 这样你能一眼看出是不是多了一个空格，或者大写小写不对
    echo json_encode([
        "success" => false, 
        "message" => "用户不存在。数据库里找不到: [" . $email . "]"
    ]);
}
exit;
?>