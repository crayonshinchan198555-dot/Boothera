<?php
// 使用 getenv() 从 Railway 的 Variables 中读取配置
$host   = getenv('DB_HOST');
$port   = getenv('DB_PORT');
$user   = getenv('DB_USER');
$pass   = getenv('DB_PASS');
$dbname = getenv('DB_NAME');

$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// 使用 @ 符号防止报错信息直接输出到页面
if (!@$conn->real_connect($host, $user, $pass, $dbname, $port)) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        "success" => false, 
        "message" => "数据库连接失败，请检查配置",
        "debug" => "Host: $host, User: $user" // 仅在调试时查看，解决后可删除
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>