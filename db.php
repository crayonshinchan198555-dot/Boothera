<?php
// db.php - 彻底硬编码测试版
// 强制 Session 在整个域名下都生效，而不仅仅是当前文件夹

// ⚠️ 直接在此处填入你从 Railway 获取的正确公网信息
$host = "hayabusa.proxy.rlwy.net";
$port = 59703;
$user = "root";
$pass = "LJOfpahcEEtABdvRmGNdPymJtuMUNQVn"; 
$dbname = "railway"; // 这里的数据库名填你 Variables 里看到的那个

// 建立连接
$conn = mysqli_init();
// 如果连接依然报错，请尝试注释下面这行 SSL 配置再测试
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// 尝试连接
if (!$conn->real_connect($host, $user, $pass, $dbname, $port, NULL, MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT)) {
    // 如果报错，这里会把具体原因打印在屏幕上
    die("数据库连接失败: " . mysqli_connect_error() . " | Host: " . $host . " | Port: " . $port);
}

// 设置字符集
$conn->set_charset("utf8mb4");

// 连接成功则什么都不输出，保证程序正常运行
?>