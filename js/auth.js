import { supabase } from './supabase.js';

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');
const authTitle = document.getElementById('authTitle');
const switchBtn = document.getElementById('switchBtn');
const switchText = document.getElementById('switchText');
const forgotPwdBtn = document.getElementById('forgotPwdBtn');

let isLoginMode = true;

window.togglePwd = function(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    
    btn.innerHTML = isPwd 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
};

switchBtn.addEventListener('click', () => {
    const confirmGroup = document.getElementById('confirmPwdGroup');
    isLoginMode = !isLoginMode;
    errorMsg.textContent = '';
    
    if (isLoginMode) {
        authTitle.textContent = 'Welcome Back';
        submitBtn.textContent = 'Log In';
        switchText.textContent = "Don't have an account?";
        switchBtn.textContent = 'Sign Up';
        confirmGroup.style.display = 'none';
        document.getElementById('confirmPassword').removeAttribute('required');
        forgotPwdBtn.style.display = 'inline-block';
    } else {
        authTitle.textContent = 'Create Account';
        submitBtn.textContent = 'Sign Up';
        switchText.textContent = "Already have an account?";
        switchBtn.textContent = 'Log In';
        confirmGroup.style.display = 'block';
        document.getElementById('confirmPassword').setAttribute('required', 'true');
        forgotPwdBtn.style.display = 'none';
    }
});

forgotPwdBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const resetEmail = window.prompt('Enter your email to receive a password reset link:', email);
    
    if (!resetEmail) return;

    try {
        const resetUrl = window.location.origin + window.location.pathname.replace('auth.html', 'account.html');

        const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: resetUrl
        });
        if (error) throw error;
        alert('One-time link sent! Please update your password after login.');
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!isLoginMode && password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match.';
        return;
    }

    if (!email || !password) {
        errorMsg.textContent = 'Please fill in all fields.';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    errorMsg.textContent = '';

    try {
        if (isLoginMode) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.href = 'index.html';
        } else {
            const redirectUrl = window.location.origin + window.location.pathname.replace('auth.html', 'index.html');

            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    emailRedirectTo: redirectUrl
                }
            });
            if (error) throw error;
            
            alert('Registration successful! Please check your email to confirm your account.');
            switchBtn.click(); 
        }
    } catch (error) {
        if (error.message.includes('Email not confirmed')) {
            errorMsg.textContent = 'Please confirm your email. Check your inbox for the confirmation link.';
        } else if (error.message.includes('Invalid login credentials')) {
            errorMsg.textContent = 'Invalid email or password.';
        } else {
            errorMsg.textContent = error.message; 
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Log In' : 'Sign Up';
    }
});