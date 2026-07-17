<?php
// ... 前面的代码不变 ...

if ($password === $row['password']) {
    $_SESSION['user_email'] = $email;
    
    // 【修正路径】：根据你的文件夹结构指定正确路径
    // admin 在 adminpages/home.php
    // user 在 user_pages/user.php
    $target = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';
    
    echo json_encode([
        "success" => true, 
        "message" => "登录成功", 
        "redirect" => $target // 这里传的就是正确的相对路径
    ]);
} else {
    echo json_encode(["success" => false, "message" => "密码错误"]);
}
// ... 后面的代码不变 ...
?>