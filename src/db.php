<?php
// db.php - 数据库连接核心文件

// 🚨 关键：在 Docker 容器网络里，Host 要写 MySQL 的服务名 'db'
$host = "db"; 
$user = "root";
$pass = "root";        // 对应你 docker-compose.yml 里的 MYSQL_ROOT_PASSWORD
$dbname = "boothera";  // 对应你自动创建的数据库名字

// 建立连接
$conn = new mysqli($host, $user, $pass, $dbname);

// 检查连接是否成功
if ($conn->connect_error) {
    // 如果连接失败，输出 JSON 报错信息，方便前端调试
    die(json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

// 设置字符集为 utf8mb4，确保支持中文和各种特殊符号
$conn->set_charset("utf8mb4");
?>