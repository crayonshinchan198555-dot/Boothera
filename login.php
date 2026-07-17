<?php
session_start();
require_once 'db.php';

// ====== 【加分项：登录失败锁死检查】 ======
if (isset($_SESSION['lockout_time'])) {
    if (time() - $_SESSION['lockout_time'] < 30) {
        $error_message = 'Too many failed attempts. Please wait 30 seconds.';
    } else {
        unset($_SESSION['lockout_time']);
        $_SESSION['failed_attempts'] = 0;
    }
}

// 如果已经登录，直接去对应页面
if (isset($_SESSION['user_email'])) {
    // 这里简单判断跳转，具体逻辑根据你实际的 role 定义
    header('Location: user_pages/user.php');
    exit();
}

$error_message = (isset($error_message) && $error_message !== '') ? $error_message : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_SESSION['lockout_time'])) {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (!empty($email) && !empty($password)) {
        $stmt = $conn->prepare("SELECT `password`, `role` FROM `Users` WHERE `e-mail` = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if ($password === $row['password']) {
                // 登录成功
                $_SESSION['user_email'] = $email;
                $_SESSION['last_activity'] = time(); // 超时检查初始化
                $_SESSION['failed_attempts'] = 0;

                // ====== 【记住邮箱 Cookie 功能】 ======
                if (isset($_POST['remember_me'])) {
                    setcookie('remembered_email', $email, time() + 604800, '/', '', false, true);
                } else {
                    setcookie('remembered_email', '', time() - 3600, '/');
                }

                $target = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';
                header('Location: ' . $target);
                exit();
            } else {
                // 密码错误逻辑
                $error_message = 'Invalid password.';
                if (!isset($_SESSION['failed_attempts'])) $_SESSION['failed_attempts'] = 0;
                $_SESSION['failed_attempts']++;
                if ($_SESSION['failed_attempts'] >= 3) {
                    $_SESSION['lockout_time'] = time();
                    $error_message = 'Too many failed attempts. You are locked out for 30 seconds.';
                }
            }
        } else {
            $error_message = 'User not found.';
        }
        $stmt->close();
    } else {
        $error_message = 'Please fill in both fields.';
    }
}

$remembered_email = isset($_COOKIE['remembered_email']) ? $_COOKIE['remembered_email'] : '';
?>

<!-- 下面是你的 HTML 部分 -->
<form method="post" action="login.php">
    <div>
        <label>Email:</label>
        <input type="email" name="email" id="login-email" value="<?php echo htmlspecialchars($remembered_email); ?>" required>
    </div>
    <div>
        <label>Password:</label>
        <input type="password" name="password" id="password" required>
    </div>
    
    <div>
        <input type="checkbox" name="remember_me" id="remember_me" <?php echo !empty($remembered_email) ? 'checked' : ''; ?>>
        <label for="remember_me">Remember my email</label>
    </div>

    <?php if (!empty($error_message)): ?>
        <p style="color:red;"><?php echo htmlspecialchars($error_message); ?></p>
    <?php endif; ?>

    <button type="submit">LOGIN</button>
</form>