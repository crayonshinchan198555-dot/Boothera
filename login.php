<?php
// 强行把所有收到的 POST 数据记下来
file_put_contents('debug.txt', print_r($_POST, true));

// 如果有数据，返回成功；没数据，返回调试信息
if (!empty($_POST['email'])) {
    echo json_encode(["success" => true, "message" => "PHP收到了: " . $_POST['email']]);
} else {
    echo json_encode(["success" => false, "message" => "PHP收到的POST是空的: " . print_r($_POST, true)]);
}
exit;
?>