<?php
// 把下面的信息换成你的真实环境变量
$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$db   = getenv('DB_NAME');

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}
echo "连接成功！数据库没问题。";
?>