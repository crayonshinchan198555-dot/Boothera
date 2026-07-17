<?php
// db.php - 智能适配本地与云端的数据库连接文件

// 1. 获取环境变量 (Railway 提供 DB_URL，或者手动设置 DB_HOST 等)
$dbUrl = getenv('DB_URL');

if ($dbUrl) {
    // ☁️ 云端模式 (Railway)
    // 自动解析 Railway 提供的 URL 格式: mysql://user:pass@host:port/dbname
    $url = parse_url($dbUrl);
    $host = $url["host"];
    $user = $url["user"];
    $pass = isset($url["pass"]) ? $url["pass"] : "";
    $dbname = ltrim($url["path"], '/');
    $port = isset($url["port"]) ? $url["port"] : 3306;
} else {
    // 🏠 本地模式 (Docker/开发环境)
    $host = getenv('DB_HOST') ?: "db";
    $user = getenv('DB_USER') ?: "root";
    $pass = getenv('DB_PASS') ?: "root";
    $dbname = getenv('DB_NAME') ?: "boothera";
    $port = getenv('DB_PORT') ?: 3306;
}

// 2. 建立连接
// 使用 mysqli_init 初始化，以便配置 SSL
// 3. 执行连接
$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

if (!$conn->real_connect($host, $user, $pass, $dbname, $port, NULL, MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT)) {
    // ⚠️ 关键修改：不要用 die() 隐藏信息，直接打印出真实的数据库报错！
    die("数据库连接失败 (Debug): " . mysqli_connect_error() . " | Host: " . $host . " | User: " . $user);
}

// 4. 设置字符集
$conn->set_charset("utf8mb4");

// 成功连接后，不需要输出任何东西，保持静默即可
?>