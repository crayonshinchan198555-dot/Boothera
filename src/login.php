<?php
session_start();

// 🚨 调试模式：强制关闭 JSON，直接输出错误信息到屏幕
// 如果你看到页面上有任何文字，那就是连接失败的原因
error_reporting(E_ALL);
ini_set('display_errors', 1);

$h = getenv('DB_HOST');
$u = getenv('DB_USER');
$p = getenv('DB_PASS');
$d = getenv('DB_NAME');
$port = getenv('DB_PORT') ?: 3306;

// 测试连接
$conn = new mysqli($h, $u, $p, $d, $port);

if ($conn->connect_error) {
    die("<h1>❌ 数据库连接失败!</h1><p>错误原因: " . $conn->connect_error . "</p><p>检查一下 Render 里的变量: Host=$h, User=$u, DB=$d, Port=$port</p>");
}

// 如果连上了，这里会输出“连接成功”
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($email) || empty($password)) {
        die("Email and password cannot be empty!");
    }

    $email = mysqli_real_escape_string($conn, $email);
    $sql = "SELECT * FROM Users WHERE `e-mail` = '$email'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // 使用 password_verify 比对密码 (如果你的数据库存的是 hash)
        // 如果你存的是明文，请改回 if ($password == $row['password'])
        if (password_verify($password, $row['password']) || $password == $row['password']) {
            $_SESSION['isLoggedIn'] = true;
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['name'] = $row['name'];
            $_SESSION['userRole'] = $row['role']; 

            header("Content-Type: application/json");
            echo json_encode(["success" => true, "message" => "Login Successful!", "role" => $row['role']]);
            exit;
        } else {
            die("❌ 密码错误！");
        }
    } else {
        die("❌ 用户不存在！");
    }
} else {
    echo "请通过 POST 请求登录。";
}
$conn->close();
?>