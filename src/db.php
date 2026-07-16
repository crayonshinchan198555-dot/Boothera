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
// 修改 db.php 中的连接检查部分
if ($conn->connect_error) {
    // 报错时直接输出真实连接信息，这样我们就能看到它在连哪台机器
    die("Connection failed: " . $conn->connect_error . " (Host: " . $host . ", DB: " . $dbname . ")");
}

$conn->set_charset("utf8mb4");
?>