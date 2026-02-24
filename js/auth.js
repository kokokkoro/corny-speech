import { supabase } from './supabase.js';

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');
const authTitle = document.getElementById('authTitle');
const switchBtn = document.getElementById('switchBtn');
const switchText = document.getElementById('switchText');

let isLoginMode = true;

switchBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    errorMsg.textContent = '';
    
    if (isLoginMode) {
        authTitle.textContent = 'Welcome Back';
        submitBtn.textContent = 'Log In';
        switchText.textContent = "Don't have an account?";
        switchBtn.textContent = 'Sign Up';
    } else {
        authTitle.textContent = 'Create Account';
        submitBtn.textContent = 'Sign Up';
        switchText.textContent = "Already have an account?";
        switchBtn.textContent = 'Log In';
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
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
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            alert('Registration successful! You can now log in.');
            
            switchBtn.click(); 
        }
    } catch (error) {
        errorMsg.textContent = error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Log In' : 'Sign Up';
    }
});