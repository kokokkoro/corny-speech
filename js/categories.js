import { supabase } from './supabase.js';

const container = document.getElementById('categoriesContainer');
const newCatName = document.getElementById('newCatName');
const addCatBtn = document.getElementById('addCatBtn');

let currentUser = null;
let categories = [];
let topics = [];
let hiddenTopicIds = [];
let hiddenCategoryIds = [];

async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'auth.html'; return; }
    currentUser = session.user;
    await loadData();
}

async function loadData() {
    const [catsRes, topicsRes, hiddenTopicsRes, hiddenCatsRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('topics').select('*').order('created_at', { ascending: true }),
        supabase.from('hidden_base_topics').select('topic_id').eq('user_id', currentUser.id),
        supabase.from('hidden_categories').select('category_id').eq('user_id', currentUser.id)
    ]);

    categories = catsRes.data || [];
    topics = topicsRes.data || [];
    hiddenTopicIds = hiddenTopicsRes.data ? hiddenTopicsRes.data.map(h => h.topic_id) : [];
    hiddenCategoryIds = hiddenCatsRes.data ? hiddenCatsRes.data.map(h => h.category_id) : [];

    render();
}

function render() {
    container.innerHTML = '';
    if (categories.length === 0) return container.innerHTML = '<p>No categories found.</p>';

    categories.forEach(cat => {
        const catTopics = topics.filter(t => t.category_id === cat.id);
        const isBaseCat = cat.user_id === null;
        const isCatHidden = hiddenCategoryIds.includes(cat.id);

        const card = document.createElement('div');
        card.className = 'cat-card';
        
        let html = `
            <div class="cat-header ${isCatHidden ? 'hidden-cat' : ''}" data-toggle="${cat.id}">
                <div>
                    <span class="cat-title">${cat.name}</span>
                    <span class="badge">${isBaseCat ? 'Base' : 'Custom'}</span>
                    <span style="font-size:0.8rem; margin-left:10px; color:var(--text-secondary)">▼</span>
                </div>
                <div class="cat-actions">
                    ${isCatHidden 
                        ? `<button class="btn-small restore restore-cat-btn" data-id="${cat.id}">Restore</button>`
                        : `<button class="btn-small hide-cat-btn" data-id="${cat.id}">Hide</button>`
                    }
                    ${!isBaseCat ? `<button class="btn-small delete-cat-btn" data-id="${cat.id}">Delete</button>` : ''}
                </div>
            </div>
            <div class="cat-body" id="body-${cat.id}">
                <div class="topics-list">
        `;

        catTopics.forEach(topic => {
            const isBaseTopic = topic.user_id === null;
            const isHidden = hiddenTopicIds.includes(topic.id);
            
            html += `
                <div class="topic-row">
                    <div class="topic-text ${isHidden ? 'hidden' : ''}">${topic.content}</div>
                    <div>
                        ${isHidden 
                            ? `<button class="btn-small restore restore-topic-btn" data-id="${topic.id}">Restore</button>` 
                            : `<button class="btn-small hide-topic-btn" data-id="${topic.id}">Hide</button>`
                        }
                        ${!isBaseTopic ? `<button class="btn-small delete-topic-btn" data-id="${topic.id}">Delete</button>` : ''}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                <div class="add-box" style="margin-top: 15px; margin-bottom: 0;">
                    <input type="text" class="form-control new-topic-input" placeholder="Add new topic..." maxlength="64" data-catid="${cat.id}">
                    <button class="btn-time add-topic-btn" data-catid="${cat.id}">Add</button>
                </div>
            </div>
        `;

        card.innerHTML = html;
        container.appendChild(card);
    });

    attachEventListeners();
}

function attachEventListeners() {
    document.querySelectorAll('.cat-header').forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; 
            const catId = header.getAttribute('data-toggle');
            document.getElementById(`body-${catId}`).classList.toggle('open');
        });
    });

    document.querySelectorAll('.new-topic-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.nextElementSibling.click();
            }
        });
    });

    document.querySelectorAll('.add-topic-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const catId = e.target.getAttribute('data-catid');
            const input = document.querySelector(`.new-topic-input[data-catid="${catId}"]`);
            const content = input.value.trim();
            if (!content) return;
            if (content.length > 64) return alert('Max 64 characters.');
            e.target.disabled = true;
            await supabase.from('topics').insert({ category_id: catId, content: content, user_id: currentUser.id });
            await loadData();
            document.getElementById(`body-${catId}`).classList.add('open'); 
        });
    });

    document.querySelectorAll('.delete-topic-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await supabase.from('topics').delete().eq('id', e.target.getAttribute('data-id'));
            await loadData();
        });
    });

    document.querySelectorAll('.hide-topic-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await supabase.from('hidden_base_topics').insert({ user_id: currentUser.id, topic_id: e.target.getAttribute('data-id') });
            await loadData();
        });
    });

    document.querySelectorAll('.restore-topic-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await supabase.from('hidden_base_topics').delete().match({ user_id: currentUser.id, topic_id: e.target.getAttribute('data-id') });
            await loadData();
        });
    });

    document.querySelectorAll('.hide-cat-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await supabase.from('hidden_categories').insert({ user_id: currentUser.id, category_id: e.target.getAttribute('data-id') });
            await loadData();
        });
    });

    document.querySelectorAll('.restore-cat-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await supabase.from('hidden_categories').delete().match({ user_id: currentUser.id, category_id: e.target.getAttribute('data-id') });
            await loadData();
        });
    });

    document.querySelectorAll('.delete-cat-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm('Delete this category and all topics?')) {
                await supabase.from('categories').delete().eq('id', e.target.getAttribute('data-id'));
                await loadData();
            }
        });
    });
}

newCatName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCatBtn.click(); }
});

addCatBtn.addEventListener('click', async () => {
    const name = newCatName.value.trim();
    if (!name) return;
    addCatBtn.disabled = true;
    await supabase.from('categories').insert({ name: name, lang: 'en', user_id: currentUser.id });
    newCatName.value = '';
    addCatBtn.disabled = false;
    await loadData();
});

init();