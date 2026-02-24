import { supabase } from './supabase.js';

const settingsForm = document.getElementById('settingsForm');
const themeSelect = document.getElementById('themeSelect');
const fontSelect = document.getElementById('fontSelect');
const saveBtn = document.getElementById('saveBtn');
const saveMsg = document.getElementById('saveMsg');

let currentUser = null;

async function initSettings() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    currentUser = session.user;

    const { data, error } = await supabase
        .from('user_settings')
        .select('theme, font')
        .eq('user_id', currentUser.id)
        .single();

    if (data) {
        themeSelect.value = data.theme;
        fontSelect.value = data.font;
    }
}
settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    saveMsg.textContent = '';
    saveMsg.style.color = '#10b981';

    const newTheme = themeSelect.value;
    const newFont = fontSelect.value;

    const { error } = await supabase
        .from('user_settings')
        .upsert({ 
            user_id: currentUser.id, 
            theme: newTheme, 
            font: newFont 
        });

    if (error) {
        saveMsg.style.color = '#ef4444';
        saveMsg.textContent = 'Error saving settings.';
        console.error(error);
    } else {
        saveMsg.textContent = 'Settings saved successfully!';
        document.body.className = `theme-${newTheme} font-${newFont}`;
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
});

initSettings();