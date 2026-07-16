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
    // Prevent form from actual submission reload
    event.preventDefault();
    
    let isFormValid = true;

    // Validate all text/tel/email/password inputs
    const inputs = document.querySelectorAll('.form-group input');
    
    inputs.forEach(input => {
        // Find correct wrapper container (handles regular inputs vs password wrapper layers)
        const formGroup = input.parentElement.classList.contains('password-wrapper') 
            ? input.parentElement.parentElement 
            : input.parentElement;

        // Force enforcement rule: Cannot be empty/blank spaces
        if (!input.value.trim()) {
            formGroup.classList.add('invalid');
            isFormValid = false;
        } else {
            formGroup.classList.remove('invalid');
        }

        // Standard regex pattern validation for Email
        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                formGroup.classList.add('invalid');
                isFormValid = false;
            }
        }
    });

    // Check Password Matching Accuracy
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

    // Success Hook Execution
    if (isFormValid) {
    //  加入这行代码，让表单在前端验证完全通过后，正式提交给 signup.php
        document.getElementById('signupForm').submit();
    }
});

// 3. Clear warning messages automatically as soon as the user starts typing
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