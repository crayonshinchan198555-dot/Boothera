<?php
session_start();

// ====== 【加分项：登录失败锁死检查】 ======
if (isset($_SESSION['lockout_time'])) {
    if (time() - $_SESSION['lockout_time'] < 30) {
        // 如果还没到 30 秒，强行拦截，不让用户登录
        $error_message = 'Too many failed attempts. Please wait 30 seconds.';
        // 为了完全不改动你后面的 HTML 逻辑，这里通过重写 $_SERVER 阻止 POST 业务执行
        $_SERVER['REQUEST_METHOD'] = 'GET'; 
    } else {
        // 超过 30 秒了，自动解锁，重置计数器
        unset($_SESSION['lockout_time']);
        $_SESSION['failed_attempts'] = 0;
    }
}
// ==========================================

// 如果已经登录，直接去 dashboard
if (isset($_SESSION['username'])) {
    header('Location: dashboard.php');
    exit();
}

$error_message = (isset($error_message) && $error_message !== '') ? $error_message : '';

// 硬编码的用户数据 (Part A)
$users = [
    "alice" => "pass123",
    "bob" => "hunter2"
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (!empty($username) && !empty($password)) {
        // 验证用户名和密码
        if (array_key_exists($username, $users) && $users[$username] === $password) {
            $_SESSION['username'] = $username;
            
            // ====== 【加分项：初始化超时检查时间】 ======
            $_SESSION['last_activity'] = time();
            // ============================================

            // ====== 【Part B：记住用户名 Cookie 功能】 ======
            if (isset($_POST['remember_me'])) {
                // 勾选了就记住 7 天 (7 * 24 * 3600 秒)
                setcookie('remembered_username', $username, time() + 604800, '/', '', false, true);
            } else {
                // 没勾选就让 Cookie 立即过期
                setcookie('remembered_username', '', time() - 3600, '/');
            }
            // ================================================

            // 登录成功后清空登录失败计数
            $_SESSION['failed_attempts'] = 0;

            // 登录成功，重定向到 dashboard
            header('Location: dashboard.php');
            exit();
        } else {
            $error_message = 'Invalid username or password.';

            // ====== 【加分项：累计失败次数】 ======
            if (!isset($_SESSION['failed_attempts'])) {
                $_SESSION['failed_attempts'] = 0;
            }
            $_SESSION['failed_attempts']++;

            if ($_SESSION['failed_attempts'] >= 3) {
                $_SESSION['lockout_time'] = time();
                $error_message = 'Too many failed attempts. You are locked out for 30 seconds.';
            }
            // =======================================
        }
    } else {
        $error_message = 'Please fill in both fields.';
    }
}

// ====== 【Part B：读取被记住的用户名】 ======
$remembered_user = isset($_COOKIE['remembered_username']) ? $_COOKIE['remembered_username'] : '';
// ============================================
?>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <style>
        body { font-family: sans-serif; max-width: 400px; margin: 40px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
        .error { color: red; margin-bottom: 15px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; }
        .form-group input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { padding: 8px 15px; background: #007BFF; color: white; border: none; border-radius: 3px; cursor: pointer; }
        /* 稍微加个小样式让勾选框好看点 */
        .remember-group { margin-bottom: 15px; display: flex; align-items: center; }
        .remember-group input { width: auto; margin-right: 8px; }
    </style>
</head>
<body>
<h2>Login</h2>

<?php if (!empty($error_message)): ?>
    <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
<?php endif; ?>

<form method="post" action="login.php">
    <div class="form-group">
        <label>Username:</label>
        
        <input type="text" name="username" value="<?php echo htmlspecialchars($remembered_user); ?>" required>
    </div>
    <div class="form-group">
        <label>Password:</label>
        <input type="password" name="password" required>
    </div>
    
    
    <div class="remember-group">
        <input type="checkbox" name="remember_me" id="remember_me" <?php echo !empty($remembered_user) ? 'checked' : ''; ?>>
        <label for="remember_me">Remember my username</label>
    </div>

    <button type="submit">Log In</button>
</form>
</body>
</html>