import { supabase } from './supabase.js';

const headerElement = document.querySelector('header');

const icons = {
    home: '<svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>',
    categories: '<svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>',
    settings: '<svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>',
    account: '<svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>',
    login: '<svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>',
    logout: '<svg class="menu-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/></svg>'
};

if (headerElement) {
    headerElement.innerHTML = `
        <div class="brand-logo">
            <span class="brand-corny">Corny</span>
            <span class="brand-speech">Speech</span>
        </div>
        <div class="menu-container">
            <div class="menu-btn" id="menuBtn">
                <span></span><span></span><span></span>
            </div>
            <nav class="dropdown-menu" id="dropdownMenu">
                <ul id="menuList"></ul>
            </nav>
        </div>
    `;
}

const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const menuList = document.getElementById('menuList');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('active');
    });
}

async function applyUserSettings(userId) {
    const { data, error } = await supabase
        .from('user_settings')
        .select('theme, font')
        .eq('user_id', userId)
        .single();

    if (data) {
        document.body.className = `theme-${data.theme} font-${data.font}`;
    }
}

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        applyUserSettings(session.user.id);

        if (menuList) {
            menuList.innerHTML = `
                <li><a href="index.html">${icons.home} Home</a></li>
                <li><a href="categories.html">${icons.categories} Categories & Topics</a></li>
                <li><a href="settings.html">${icons.settings} Settings</a></li>
                <li><a href="account.html">${icons.account} Account</a></li>
                <li><a href="#" id="logoutBtn">${icons.logout} Logout</a></li>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            });
        }
    } else {
        if (menuList) {
            menuList.innerHTML = `
                <li><a href="index.html">${icons.home} Home</a></li>
                <li><a href="auth.html">${icons.login} Log In</a></li>
            `;
        }
        document.body.className = 'theme-dark font-serif';
    }
}

checkAuth();