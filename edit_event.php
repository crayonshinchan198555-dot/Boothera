<?php
// edit_event.php
require_once 'db.php';

$errorMsg = '';
$successMsg = '';
$event = null;

// 1. 获取要编辑的活动 ID
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $id = intval($_GET['id']);
    
    // 从数据库读取这条记录
    $sql = "SELECT * FROM Events WHERE event_id = $id";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $event = $result->fetch_assoc();
    } else {
        $errorMsg = "找不到该活动的详细信息。";
    }
}

// 2. 处理表单提交（更新数据）
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['update_event'])) {
    $id = intval($_POST['event_id']);
    // 使用 real_escape_string 防止简单的 SQL 注入
    $name = $conn->real_escape_string($_POST['event_name']);
    $venue = $conn->real_escape_string($_POST['venue']);
    $date = $conn->real_escape_string($_POST['date']);
    $time = $conn->real_escape_string($_POST['time']);
    $desc = $conn->real_escape_string($_POST['description']);
    $price = floatval($_POST['booth_price']);

    $updateSql = "UPDATE Events SET 
                    event_name = '$name', 
                    venue = '$venue', 
                    date = '$date', 
                    time = '$time', 
                    description = '$desc', 
                    booth_price = $price 
                  WHERE event_id = $id";

    if ($conn->query($updateSql) === TRUE) {
        $successMsg = "活动信息更新成功！";
        // 更新成功后重新读取一次最新数据展示在表单里
        $event['event_name'] = $name;
        $event['venue'] = $venue;
        $event['date'] = $date;
        $event['time'] = $time;
        $event['description'] = $desc;
        $event['booth_price'] = $price;
    } else {
        $errorMsg = "更新失败: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Edit Event - BOOTHERA</title>
    <!-- 这里你可以引入你自己的 CSS，下面写了一点基础样式防崩 -->
    <style>
        body { font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px; display: flex; justify-content: center; }
        .edit-form-container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 600px; }
        h2 { margin-top: 0; color: #2d3748; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #4a5568; font-weight: bold; }
        input[type="text"], input[type="date"], input[type="time"], input[type="number"], textarea {
            width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 4px; box-sizing: border-box; font-size: 14px;
        }
        .btn-submit { background-color: #3182ce; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; margin-top: 10px; }
        .btn-submit:hover { background-color: #2b6cb0; }
        .btn-back { display: inline-block; margin-top: 15px; text-decoration: none; color: #718096; text-align: center; width: 100%; }
        .msg-success { color: #38a169; background: #c6f6d5; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
        .msg-error { color: #e53e3e; background: #fed7d7; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
    </style>
</head>
<body>

<div class="edit-form-container">
    <h2>编辑活动信息</h2>

    <?php if ($successMsg): ?>
        <div class="msg-success"><?php echo $successMsg; ?></div>
    <?php endif; ?>
    
    <?php if ($errorMsg): ?>
        <div class="msg-error"><?php echo $errorMsg; ?></div>
    <?php endif; ?>

    <?php if ($event): ?>
        <form action="edit_event.php?id=<?php echo $id; ?>" method="POST">
            <!-- 隐藏字段，用于传递被编辑的 ID -->
            <input type="hidden" name="event_id" value="<?php echo htmlspecialchars($event['event_id']); ?>">
            
            <div class="form-group">
                <label>活动名称 (Event Name)</label>
                <input type="text" name="event_name" value="<?php echo htmlspecialchars($event['event_name']); ?>" required>
            </div>
            
            <div class="form-group">
                <label>场地 (Venue)</label>
                <input type="text" name="venue" value="<?php echo htmlspecialchars($event['venue']); ?>" required>
            </div>
            
            <div style="display:flex; gap:15px;">
                <div class="form-group" style="flex:1;">
                    <label>日期 (Date)</label>
                    <input type="date" name="date" value="<?php echo htmlspecialchars($event['date']); ?>" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>时间 (Time)</label>
                    <input type="time" name="time" value="<?php echo htmlspecialchars($event['time']); ?>" required>
                </div>
            </div>

            <div class="form-group">
                <label>展位价格 (Booth Price RM)</label>
                <input type="number" step="0.01" name="booth_price" value="<?php echo htmlspecialchars($event['booth_price']); ?>" required>
            </div>
            
            <div class="form-group">
                <label>活动描述 (Description)</label>
                <textarea name="description" rows="4" required><?php echo htmlspecialchars($event['description']); ?></textarea>
            </div>

            <button type="submit" name="update_event" class="btn-submit">保存修改</button>
        </form>
    <?php else: ?>
        <p>无法加载编辑表单，请返回重试。</p>
    <?php endif; ?>

    <!-- 这里假设你的主页是 home.html 或者 admin_event.php，请根据实际情况修改 href -->
    <a href="adminpages/home.html" class="btn-back">返回管理列表</a>
</div>

</body>
</html>