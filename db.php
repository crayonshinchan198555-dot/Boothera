<?php
// db.php - 确保没有任何 echo, print 或多余的空格
$host = "hayabusa.proxy.rlwy.net";
$port = 59703;
$user = "root";
$pass = "LJOfpahcEETABdvRmGNdPymJtuMUNQVn";
$dbname = "railway";

$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// 如果连接失败，强制输出 JSON 并停止执行
if (!$conn->real_connect($host, $user, $pass, $dbname, $port)) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(["success" => false, "message" => "数据库连接失败"]);
    exit;
}

$conn->set_charset("utf8mb4");
?>