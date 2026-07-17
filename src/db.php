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
$conn = mysqli_init();

// 很多云数据库(如 Railway)要求 SSL，开启此选项更稳妥
// 如果连接时报错说找不到 SSL，请注释掉 mysqli_ssl_set 这一行
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// 3. 执行连接
if (!$conn->real_connect($host, $user, $pass, $dbname, $port, NULL, MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT)) {
    // 错误处理：输出明确的错误信息方便调试
    die(json_encode([
        "success" => false,
        "message" => "Database Connection Failed: " . mysqli_connect_error(),
        "debug_info" => "Host: $host, DB: $dbname"
    ]));
}

// 4. 设置字符集
$conn->set_charset("utf8mb4");

// 成功连接后，不需要输出任何东西，保持静默即可
?>