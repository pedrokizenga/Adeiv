import { supabase } from './supabase.js';

let myChartSource = null;
let myChartRevenue = null;

async function loadDashboard() {
    if (!supabase) {
        document.getElementById('supabaseWarning').style.display = 'block';
        return; // Use mock data or stop
    }

    try {
        // Fetch all leads ordered by newest
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        updateStats(leads);
        updateCharts(leads);
        renderTable(leads);

    } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        alert("Erro ao carregar dados. Verifique o console.");
    }
}

function updateStats(leads) {
    // Total
    document.getElementById('totalLeads').innerText = leads.length;

    // Today
    const today = new Date().toISOString().split('T')[0];
    const leadsToday = leads.filter(l => l.created_at.startsWith(today)).length;
    document.getElementById('todayLeads').innerText = leadsToday;

    // High Value Lead Score (Revenue 5M+ or Ready)
    const hotLeadsCount = leads.filter(l =>
        (l["Faturamento Mensal"] === "5M+") ||
        (l["Pretende investir agora?"] === "ready")
    ).length;

    const hotRate = leads.length > 0 ? ((hotLeadsCount / leads.length) * 100).toFixed(1) : 0;
    document.getElementById('hotLeads').innerText = `${hotLeadsCount} (${hotRate}%)`;

    // Top Growth Channel
    const campaigns = {};
    leads.forEach(l => {
        if (l.utm_campaign) campaigns[l.utm_campaign] = (campaigns[l.utm_campaign] || 0) + 1;
    });

    const sorted = Object.entries(campaigns).sort((a, b) => b[1] - a[1]);
    const topText = sorted.length > 0 ? sorted[0][0] : 'Orgânico';
    document.getElementById('topCampaign').innerText = topText;
}

function renderTable(leads) {
    const tbody = document.getElementById('leadsTableBody');
    tbody.innerHTML = '';

    leads.slice(0, 50).forEach(lead => {
        const tr = document.createElement('tr');

        // Date Format
        const date = new Date(lead.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        // Source Tag
        const source = lead.utm_source ? `<span class="tag utm">${lead.utm_source}</span>` : `<span class="tag organic">Orgânico</span>`;

        // Truncate function
        const trunc = (str, n) => (str && str.length > n) ? str.substr(0, n - 1) + '&hellip;' : str;

        tr.innerHTML = `
            <td>${date}</td>
            <td>
                <div style="font-weight:bold; color:white;">${trunc(lead.Clinica || lead["Clínica e Localização"] || 'N/A', 20)}</div>
                <div style="font-size:0.8em;">${trunc(lead["Nome completo"] || '', 20)}</div>
            </td>
            <td>${lead.WhatsApp || '-'}</td>
            <td>${source}</td>
            <td>${lead["Faturamento Mensal"] || '-'}</td>
            <td>${translateInvestment(lead["Pretende investir agora?"])}</td>
        `;

        tbody.appendChild(tr);
    });
}

function translateInvestment(val) {
    if (val === 'ready') return '<span style="color:#70e000">Compra Agora</span>';
    if (val === 'planning') return '<span style="color:#f9cb28">Planejamento</span>';
    if (val === 'curious') return '<span style="color:#94a3b8">Curioso</span>';
    return val || '-';
}

// Helper to determine readable Channel
function determineChannel(lead) {
    const source = (lead.utm_source || '').toLowerCase();
    const medium = (lead.utm_medium || '').toLowerCase();

    // Ads Logic
    if (medium.includes('cpc') || medium.includes('ads') || medium.includes('paid')) {
        if (source.includes('facebook') || source.includes('fb')) return 'Facebook Ads';
        if (source.includes('instagram') || source.includes('ig')) return 'Instagram Ads';
        if (source.includes('google')) return 'Google Ads';
        if (source.includes('tiktok')) return 'TikTok Ads';
        return 'Outros Ads';
    }

    // Organic / Social Logic
    if (source.includes('instagram') || source.includes('ig')) {
        if (medium.includes('bio')) return 'Instagram Bio';
        if (medium.includes('story')) return 'Instagram Stories';
        return 'Instagram Orgânico';
    }

    if (source.includes('facebook') || source.includes('fb')) return 'Facebook Orgânico';

    if (!source) return 'Tráfego Direto / Orgânico';

    return source.charAt(0).toUpperCase() + source.slice(1);
}

function updateCharts(leads) {
    // 1. Source Chart Data (Channels)
    const channels = {};
    leads.forEach(l => {
        const c = determineChannel(l);
        channels[c] = (channels[c] || 0) + 1;
    });

    const ctxSource = document.getElementById('sourceChart').getContext('2d');
    if (myChartSource) myChartSource.destroy();

    myChartSource = new Chart(ctxSource, {
        type: 'doughnut',
        data: {
            labels: Object.keys(channels),
            datasets: [{
                data: Object.values(channels),
                backgroundColor: ['#00d2ff', '#3a86ff', '#70e000', '#ffbd2e', '#ff5f56', '#8338ec', '#ffffff55'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: 'white' } },
                title: { display: true, text: 'Canais de Aquisição', color: 'white' }
            }
        }
    });

    // 2. Revenue Chart Data
    const revs = {};
    leads.forEach(l => {
        const r = l["Faturamento Mensal"] || 'Não Inf.';
        revs[r] = (revs[r] || 0) + 1;
    });

    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    if (myChartRevenue) myChartRevenue.destroy();

    myChartRevenue = new Chart(ctxRevenue, {
        type: 'bar',
        data: {
            labels: Object.keys(revs),
            datasets: [{
                label: 'Leads',
                data: Object.values(revs),
                backgroundColor: '#70e000',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Faturamento Declarado', color: 'white' }
            },
            scales: {
                y: { grid: { color: '#ffffff11' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// Global hook
window.refreshData = loadDashboard;
window.addEventListener('dashboard-auth-success', loadDashboard);
