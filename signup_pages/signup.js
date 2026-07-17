// 1. Show/Hide Password Toggle function
function togglePassword(inputId, icon) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// 2. Strict Submission Form Validation
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单默认提交刷新
    
    let isFormValid = true;

    // Validate all inputs
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        const formGroup = input.parentElement.classList.contains('password-wrapper') 
            ? input.parentElement.parentElement 
            : input.parentElement;

        if (!input.value.trim()) {
            formGroup.classList.add('invalid');
            isFormValid = false;
        } else {
            formGroup.classList.remove('invalid');
        }

        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                formGroup.classList.add('invalid');
                isFormValid = false;
            }
        }
    });

    // Check Password Matching
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const confirmFormGroup = confirmPassword.parentElement.parentElement;

    if (password.value !== confirmPassword.value && confirmPassword.value.trim() !== "") {
        confirmFormGroup.classList.add('invalid');
        document.getElementById('confirmError').innerText = "Passwords do not match";
        isFormValid = false;
    }

    // Force Agreement Checkbox validation
    const termsCheckbox = document.getElementById('terms');
    const termsGroup = document.querySelector('.terms-group');
    if (!termsCheckbox.checked) {
        termsGroup.classList.add('invalid-terms');
        isFormValid = false;
    } else {
        termsGroup.classList.remove('invalid-terms');
    }

    // Success Hook Execution - 发送数据到后端
    if (isFormValid) {
        const formData = new FormData(this); // this 指向 signupForm

        fetch('/signup.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // 假设你的登录页在根目录
                window.location.href = '/login.php'; 
            } else {
                alert("注册失败: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("发生错误，请查看控制台。");
        });
    }
});

// 3. Clear warning messages
const allInputs = document.querySelectorAll('.form-group input, #terms');
allInputs.forEach(input => {
    input.addEventListener('input', function() {
        const formGroup = this.parentElement.classList.contains('password-wrapper') 
            ? this.parentElement.parentElement 
            : this.parentElement;
        formGroup.classList.remove('invalid');
    });
});

document.getElementById('terms').addEventListener('change', function() {
    if (this.checked) {
        document.querySelector('.terms-group').classList.remove('invalid-terms');
    }
});