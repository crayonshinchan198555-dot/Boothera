<?php
// db.php - 智能适配本地与云端的数据库连接文件

// 1. 优先获取 Railway 提供的 DB_URL
$dbUrl = getenv('DB_URL');

if ($dbUrl) {
    // ☁️ 云端模式 (Railway)
    $url = parse_url($dbUrl);
    $host = $url["host"];
    $user = $url["user"];
    $pass = $url["pass"];
    $dbname = ltrim($url["path"], '/');
    $port = isset($url["port"]) ? $url["port"] : 3306;
} else {
    // 🏠 本地模式 (Docker)
    $host = "db";
    $user = "root";
    $pass = "root";
    $dbname = "boothera";
    $port = 3306;
}

// 建立连接
$conn = new mysqli($host, $user, $pass, $dbname, $port);

// 检查连接
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");
?>