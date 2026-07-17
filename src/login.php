<?php
session_start();

// 设置返回格式为 JSON
header("Content-Type: application/json; charset=UTF-8");

// 1. 从环境变量获取数据库信息（这是 Render 连接外部数据库的标准做法）
$servername = getenv('DB_HOST'); // 在 Render 环境里填入 Railway 的 Host
$username   = getenv('DB_USER'); // 在 Render 环境里填入 Railway 的 User
$password   = getenv('DB_PASS'); // 在 Render 环境里填入 Railway 的 Password
$dbname     = getenv('DB_NAME'); // 在 Render 环境里填入 Railway 的 Database 名

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// 2. 处理登录数据
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Email and password cannot be empty!"]);
        exit;
    }

    // 防止 SQL 注入
    $email = mysqli_real_escape_string($conn, $email);

    // 3. 查数据库
    $sql = "SELECT * FROM Users WHERE `e-mail` = '$email'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // 4. 比对密码
        if ($password == $row['password']) {
            
            // 把用户信息存进 Session (留给 message.php 备用)
            $_SESSION['isLoggedIn'] = true;
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['name'] = $row['name'];
            $_SESSION['userRole'] = $row['role']; 

            // 5. 🚀 关键：以标准 JSON 格式告知前端登录成功，并把 role 顺便传过去
            echo json_encode([
                "success" => true,
                "message" => "Login Successful!",
                "role" => $row['role']
            ]);
            exit;
            
        } else { 
            echo json_encode(["success" => false, "message" => "Invalid email or password!"]);
            exit;
        }
    } else { 
        echo json_encode(["success" => false, "message" => "Invalid email or password!"]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "message" => "Unsupported request method."]);
    exit;
}

$conn->close();
?>