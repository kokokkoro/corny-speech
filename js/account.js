import { supabase } from './supabase.js';

const userEmail = document.getElementById('userEmail');
const passwordForm = document.getElementById('passwordForm');
const newPassword = document.getElementById('newPassword');
const updateBtn = document.getElementById('updateBtn');
const accMsg = document.getElementById('accMsg');

async function initAccount() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }
    userEmail.value = session.user.email;
}

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwd = newPassword.value.trim();
    
    if (pwd.length < 6) {
        accMsg.style.color = '#ef4444';
        accMsg.textContent = 'Password must be at least 6 characters.';
        return;
    }

    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    accMsg.textContent = '';

    const { error } = await supabase.auth.updateUser({ password: pwd });

    if (error) {
        accMsg.style.color = '#ef4444';
        accMsg.textContent = error.message;
    } else {
        accMsg.style.color = '#10b981';
        accMsg.textContent = 'Password updated successfully!';
        newPassword.value = '';
    }

    updateBtn.disabled = false;
    updateBtn.textContent = 'Update Password';
});

initAccount();