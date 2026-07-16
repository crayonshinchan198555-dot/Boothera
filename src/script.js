/**Boothera 开屏动画**/
document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');

    const loginContainer = document.querySelector('.container');
    
    /* 【4行字逐个蹦出】精准时间轴明细：
      - 0.5s -> your 出来
      - 1.1s -> space, 出来
      - 1.7s -> your 出来
      - 2.3s -> stage. 出来
      - 3.2s -> 山脉 Logo 弹出
      - 4.2s -> BOOTHERA 品牌字弹出
      - 4.8s -> 画面全部完美定格
      - 5.8s -> 停留 1 秒后，整个开屏绿底平滑淡出，露出登录页
    */
    const showTimeDuration = 5800; 

    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        
        setTimeout(() => {
            splashScreen.style.display = 'none';
            
            // ⚠️ 修复：开屏动画彻底隐藏后，必须把登录页显示出来！
            if (loginContainer) {
                loginContainer.style.display = 'flex';
            }
            
        }, 800);

    }, showTimeDuration);
});

/**Login interactions**/
// 1. 登录逻辑（已修正跳转）

// 显示/隐藏密码
function togglePassword() {
    const x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

/**Forgot password**/
function openForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.style.display = 'flex';
}

function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.style.display = 'none';
}

// 获取验证码按钮动作
// 1. 点击 "Get Code" 按钮时触发
function sendCode() {
    const email = document.getElementById('reset-email').value.trim();
    if (!email) { 
        alert('Please enter your email first!'); 
        return; 
    }

    // 强制使用 Fetch 去找我们刚建好的 forgot_password.php
    fetch('forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=send_code&email=${encodeURIComponent(email)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 👇 👇 👇 重点看这里！强制让弹窗把验证码爆出来 👇 👇 👇
            alert(`[⚠️ 测试模式 - 验证码拦截成功] \n\n您的 6 位验证码是：${data.code} \n\n(复制这个数字填进去即可)`);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('无法连接到 forgot_password.php，请检查文件是否存在！');
    });
}

// 2. 点击最后的 "Reset Password" 按钮时触发
function submitNewPassword() {
    const email = document.getElementById('reset-email').value.trim();
    const code = document.getElementById('reset-code').value.trim();
    const password = document.getElementById('new-password').value.trim();

    if (!email || !code || !password) { 
        alert('Please fill in all fields!'); 
        return; 
    }

    // 提交给 forgot_password.php 进行验证并修改密码
    fetch('forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=reset_password&email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&password=${encodeURIComponent(password)}`
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            closeForgotModal(); // 成功后关闭弹窗
            // 可选：清空输入框里的值
            document.getElementById('reset-email').value = '';
            document.getElementById('reset-code').value = '';
            document.getElementById('new-password').value = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred, please try again.');
    });
}