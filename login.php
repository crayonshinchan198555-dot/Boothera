<?php
session_start();
require_once 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $conn->prepare("SELECT `password`, `role` FROM `Users` WHERE `e-mail` = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if ($password === $row['password']) {
        $_SESSION['user_email'] = $email;
        $target = ($row['role'] === 'admin') ? 'adminpages/home.php' : 'user_pages/user.php';
        echo json_encode(["success" => true, "redirect" => $target]);
    } else {
        echo json_encode(["success" => false, "message" => "密码错误"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "用户不存在"]);
}
?>