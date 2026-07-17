<?php
// add_event.php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");

// 1. 引入你现有的数据库连接，不用重复写连接代码了
require_once 'db.php'; 

if (!isset($conn)) {
    echo json_encode(["success" => false, "message" => "数据库连接变量未找到"]);
    exit;
}

// 2. 接收前端的文本数据（对齐你的前端 name 属性）
$event_name  = $_POST['event_name'] ?? '';
$venue       = $_POST['venue'] ?? '';
$date        = $_POST['date'] ?? '';
$time        = $_POST['time'] ?? '';
$booth_price = floatval($_POST['booth_price'] ?? 0);
$booths      = intval($_POST['total_booths'] ?? 0);
$description = $_POST['description'] ?? '';

// 基础验证
if (empty($event_name) || empty($venue)) {
    echo json_encode(["success" => false, "message" => "活动名称和场地不能为空。"]);
    exit;
}

$layout_map_path = null; 

// 3. 处理图片文件上传逻辑
if (isset($_FILES['layout_map']) && $_FILES['layout_map']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['layout_map']['tmp_name'];
    $fileName = $_FILES['layout_map']['name'];
    
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
    
    $uploadFileDir = './uploads/';
    $dest_path = $uploadFileDir . $newFileName;
    
    if (!is_dir($uploadFileDir)) {
        mkdir($uploadFileDir, 0777, true);
    }
    
    if(move_uploaded_file($fileTmpPath, $dest_path)) {
        // 这里返回相对于根目录的路径，或者直接返回文件名
        $layout_map_path = 'uploads/' . $newFileName; 
    } else {
        echo json_encode(["success" => false, "message" => "图片保存到服务器失败。"]);
        exit;
    }
}

// 4. 将数据插入到你原有的数据库表（对齐你的真实字段）
// 如果你的表里没有 layout_map 字段，把下面 SQL 和 bind_param 里对应的部分删掉即可
// 假定当前操作的管理员用户 ID 为 1
$user_id = 1; 

// 在 SQL 里重新把 user_id 加进去
$sql = "INSERT INTO Events (event_name, venue, date, time, description, booth_price, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

// 注意这里的参数类型变化：多加了一个整数类型的 i
$stmt->bind_param("sssssdi", $event_name, $venue, $date, $time, $description, $booth_price, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "活动创建成功"]);
} else {
    echo json_encode(["success" => false, "message" => "SQL执行失败: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>