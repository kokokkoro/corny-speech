import { supabase } from './supabase.js';

let baseTime = 60;
let timeLeft = baseTime;
let timerId = null;
const timeDisplay = document.getElementById('timeDisplay');
const rootElement = document.documentElement;
const playIcon = '<svg viewBox="0 0 24 24" width="45" height="45" fill="currentColor" style="transform: translateX(0px);"><path d="M8 5v14l11-7z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timeDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    
    const progressPct = baseTime > 0 ? (timeLeft / baseTime) * 100 : 0;
    rootElement.style.setProperty('--timer-progress', `${progressPct}%`);
}

document.getElementById('addTime').addEventListener('click', () => { 
    timeLeft += 30; baseTime = timeLeft; updateTimerDisplay(); 
});
document.getElementById('subTime').addEventListener('click', () => { 
    timeLeft = Math.max(0, timeLeft - 30); baseTime = Math.max(1, timeLeft); updateTimerDisplay(); 
});
document.getElementById('resetBtn').addEventListener('click', () => {
    clearInterval(timerId); timerId = null; 
    timeLeft = 60; baseTime = 60;
    updateTimerDisplay();
    document.getElementById('playPauseBtn').innerHTML = playIcon;
});

document.getElementById('playPauseBtn').addEventListener('click', function() {
    if (timerId) {
        clearInterval(timerId); timerId = null; 
        this.innerHTML = playIcon;
    } else {
        if (timeLeft === 0) return;
        this.innerHTML = pauseIcon;
        timerId = setInterval(() => {
            if (timeLeft > 0) { 
                timeLeft--; updateTimerDisplay(); 
            } else { 
                clearInterval(timerId); timerId = null; 
                this.innerHTML = playIcon;
                alert("Time is up!"); 
            }
        }, 1000);
    }
});

const spinBtn = document.getElementById('spinBtn');
const slotWindow = document.getElementById('slotWindow');
const mainLangSelect = document.getElementById('mainLangSelect');
let topicsPool = [];
const itemHeight = 100;

async function loadTopics(updateUI = true) {
    const { data: { session } } = await supabase.auth.getSession();
    const selectedLang = mainLangSelect.value;
    
    let query = supabase.from('topics').select('id, content, category_id, categories!inner(lang)');
    
    if (session) {
        query = query.or(`user_id.is.null,user_id.eq.${session.user.id}`);
    } else {
        query = query.is('user_id', null);
    }

    if (selectedLang !== 'all') {
        query = query.eq('categories.lang', selectedLang);
    }

    const { data: allTopics, error } = await query;
    
    if (allTopics && allTopics.length > 0) {
        let finalTopics = allTopics;

        if (session) {
            const [hiddenTopicsRes, hiddenCatsRes] = await Promise.all([
                supabase.from('hidden_base_topics').select('topic_id').eq('user_id', session.user.id),
                supabase.from('hidden_categories').select('category_id').eq('user_id', session.user.id)
            ]);
                
            const hiddenTopicIds = hiddenTopicsRes.data ? hiddenTopicsRes.data.map(h => h.topic_id) : [];
            const hiddenCatIds = hiddenCatsRes.data ? hiddenCatsRes.data.map(h => h.category_id) : [];

            finalTopics = finalTopics.filter(t => 
                !hiddenTopicIds.includes(t.id) && !hiddenCatIds.includes(t.category_id)
            );
        }

        topicsPool = finalTopics.map(t => t.content);
        
        if (updateUI) {
            if (topicsPool.length > 0) {
                setupInitialSlot();
            } else {
                slotWindow.innerHTML = '<div class="topic-item active">All topics hidden</div>';
            }
        }
    } else {
        topicsPool = [];
        if (updateUI) {
            slotWindow.innerHTML = '<div class="topic-item active">No topics found</div>';
        }
    }
}

function setupInitialSlot() {
    slotWindow.innerHTML = '';
    for(let i = 0; i < 3; i++) {
        const randomTopic = topicsPool[Math.floor(Math.random() * topicsPool.length)];
        const div = document.createElement('div');
        div.className = 'topic-item';
        div.textContent = randomTopic;
        slotWindow.appendChild(div);
    }
    slotWindow.style.transform = `translateY(0px)`;
    slotWindow.children[1].classList.add('active');
}

function buildSpinningList() {
    slotWindow.innerHTML = '';
    for(let i = 0; i < 30; i++) {
        const randomTopic = topicsPool[Math.floor(Math.random() * topicsPool.length)];
        const div = document.createElement('div');
        div.className = 'topic-item';
        div.textContent = randomTopic;
        slotWindow.appendChild(div);
    }
}

spinBtn.addEventListener('click', async () => {
    spinBtn.disabled = true;
    await loadTopics(false); 

    if (topicsPool.length === 0) {
        slotWindow.innerHTML = '<div class="topic-item active">No topics found</div>';
        spinBtn.disabled = false;
        return;
    }
    
    slotWindow.style.transition = 'none';
    slotWindow.style.transform = `translateY(0px)`;
    
    buildSpinningList();
    
    void slotWindow.offsetHeight;
    
    slotWindow.style.transition = 'transform 3s cubic-bezier(0.15, 0.85, 0.3, 1)';
    const stopIndex = 25;
    
    const translateY = -((stopIndex - 1) * itemHeight); 
    slotWindow.style.transform = `translateY(${translateY}px)`;
    
    setTimeout(() => {
        Array.from(slotWindow.children).forEach(el => el.classList.remove('active'));
        slotWindow.children[stopIndex].classList.add('active');
        spinBtn.disabled = false;
    }, 3000);
});

updateTimerDisplay();
loadTopics(true);