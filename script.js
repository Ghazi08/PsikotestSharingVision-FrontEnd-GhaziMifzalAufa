// ==========================================
// FUNGSI NAVIGASI (Single Page Application)
// ==========================================
function switchPage(pageName) {
    document.getElementById('page-all-posts').classList.add('d-none');
    document.getElementById('page-add-new').classList.add('d-none');
    document.getElementById('page-preview').classList.add('d-none');
    document.getElementById('page-edit').classList.add('d-none'); // Tambahan untuk halaman edit

    document.getElementById('nav-all-posts').classList.remove('active');
    document.getElementById('nav-add-new').classList.remove('active');
    document.getElementById('nav-preview').classList.remove('active');

    // Jika sedang di halaman edit, menu navbar tidak perlu ada yang aktif
    if (pageName !== 'edit') {
        document.getElementById('nav-' + pageName).classList.add('active');
    }

    document.getElementById('page-' + pageName).classList.remove('d-none');

    if (pageName === 'all-posts') {
        loadArticles();
    } else if (pageName === 'preview') {
        loadPreview(1); // Muat preview mulai dari halaman 1
    }
}

// ==========================================
// FUNGSI SIMPAN ARTIKEL (Add New)
// ==========================================
function saveNewArticle(status) {
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value; // Ini akan mengambil value dari option yang dipilih
    const content = document.getElementById('postContent').value;

    // Tambahkan validasi kategori wajib dipilih
    if (title.trim() === "" || category === "" || content.trim() === "") {
        alert("Peringatan: Title, Category, dan Content wajib diisi/dipilih!");
        return; 
    }
    // ... (lanjutan kode di bawahnya biarkan tetap sama)

    const newArticle = {
        id: Date.now(), 
        title: title,
        category: category,
        content: content,
        status: status 
    };

    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    articles.push(newArticle);
    localStorage.setItem('my_blog_articles', JSON.stringify(articles));

    alert("Berhasil! Artikel disimpan sebagai " + status);
    
    // Kosongkan form setelah simpan
    document.getElementById('postTitle').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postContent').value = '';

    // Otomatis pindah ke halaman All Posts (Tanpa reload browser!)
    switchPage('all-posts');
}

// ==========================================
// FUNGSI TAMPIL DATA (All Posts)
// ==========================================
function loadArticles() {
    const publishedTable = document.querySelector('#published tbody');
    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];

    let publishedHTML = '';
    let draftsHTML = '';
    let trashedHTML = '';

    // Variabel penomoran terpisah untuk tiap tab
    let pubNum = 1;
    let draftNum = 1;
    let trashNum = 1;

    articles.forEach(function(article) {
        let actionButtons = '';
        
        if (article.status === 'Trashed') {
            actionButtons = `
                <button class="btn btn-sm btn-success" onclick="restoreToDraft(${article.id})">Restore to Draft</button>
                <button class="btn btn-sm btn-dark" onclick="permanentDelete(${article.id})">Delete Permanently</button>
            `;
        } else if (article.status === 'Published') {
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="editArticle(${article.id})">Edit</button>
                <button class="btn btn-sm btn-warning text-dark" onclick="changeStatus(${article.id}, 'Draft', 'Artikel dikembalikan ke Draft.')">Keep to Draft</button>
                <button class="btn btn-sm btn-danger" onclick="moveToTrash(${article.id})">Trash</button>
            `;
        } else if (article.status === 'Draft') {
            actionButtons = `
                <button class="btn btn-sm btn-primary" onclick="editArticle(${article.id})">Edit</button>
                <button class="btn btn-sm btn-success" onclick="changeStatus(${article.id}, 'Published', 'Artikel berhasil di-Publish!')">Publish</button>
                <button class="btn btn-sm btn-danger" onclick="moveToTrash(${article.id})">Trash</button>
            `;
        }

        // Masukkan nomor urut (++) berdasarkan tab masing-masing
        if (article.status === 'Published') {
            publishedHTML += `
                <tr>
                    <td class="fw-bold">${pubNum++}</td>
                    <td>${article.title}</td>
                    <td>${article.category}</td>
                    <td class="d-flex gap-1">${actionButtons}</td>
                </tr>
            `;
        } else if (article.status === 'Draft') {
            draftsHTML += `
                <tr>
                    <td class="fw-bold">${draftNum++}</td>
                    <td>${article.title}</td>
                    <td>${article.category}</td>
                    <td class="d-flex gap-1">${actionButtons}</td>
                </tr>
            `;
        } else if (article.status === 'Trashed') {
            trashedHTML += `
                <tr>
                    <td class="fw-bold">${trashNum++}</td>
                    <td>${article.title}</td>
                    <td>${article.category}</td>
                    <td class="d-flex gap-1">${actionButtons}</td>
                </tr>
            `;
        }
    });

    // Render ke tabel Published
    if (publishedHTML !== '') {
        publishedTable.innerHTML = publishedHTML;
    } else {
        publishedTable.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Belum ada artikel Published.</td></tr>';
    }

    // Render ke tab Drafts (Lengkap dengan header berkolom nomor)
    const draftsTab = document.getElementById('drafts');
    draftsTab.innerHTML = draftsHTML !== '' 
        ? `<table class="table table-hover mt-2"><thead class="table-light"><tr><th style="width: 60px;">No.</th><th>Title</th><th>Category</th><th>Action</th></tr></thead><tbody>${draftsHTML}</tbody></table>` 
        : '<p class="text-muted mt-2">Belum ada artikel di Draft.</p>';

    // Render ke tab Trashed (Lengkap dengan header berkolom nomor)
    const trashedTab = document.getElementById('trashed');
    trashedTab.innerHTML = trashedHTML !== '' 
        ? `<table class="table table-hover mt-2"><thead class="table-light"><tr><th style="width: 60px;">No.</th><th>Title</th><th>Category</th><th>Action</th></tr></thead><tbody>${trashedHTML}</tbody></table>` 
        : '<p class="text-muted mt-2">Belum ada artikel di Trashed.</p>';
}

// Jalankan saat pertama kali dibuka
document.addEventListener('DOMContentLoaded', loadArticles);

// ==========================================
// FUNGSI PINDAH KE TRASH (Poin 1c)
// ==========================================
function moveToTrash(id) {
    // 1. Munculkan peringatan (opsional tapi bagus untuk UX)
    let confirmDelete = confirm("Yakin ingin memindahkan artikel ini ke Trash?");
    if (!confirmDelete) return; // Kalau user klik Cancel, batalkan

    // 2. Ambil semua data artikel
    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];

    // 3. Cari artikel mana yang ID-nya cocok dengan yang diklik
    let articleIndex = articles.findIndex(article => article.id === id);

    if (articleIndex !== -1) {
        // 4. Ubah statusnya menjadi 'Trashed'
        articles[articleIndex].status = 'Trashed';
        
        // 5. Simpan ulang ke memori browser
        localStorage.setItem('my_blog_articles', JSON.stringify(articles));
        
        // 6. Refresh tabel secara otomatis
        loadArticles();
    }
}

// ==========================================
// FUNGSI KEMBALIKAN DARI TRASH KE DRAFT
// ==========================================
function restoreToDraft(id) {
    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    let articleIndex = articles.findIndex(article => article.id === id);

    if (articleIndex !== -1) {
        // Ubah statusnya kembali jadi Draft
        articles[articleIndex].status = 'Draft';
        
        // Simpan pembaruan ke memori
        localStorage.setItem('my_blog_articles', JSON.stringify(articles));
        
        // Munculkan notifikasi sesuai request lu
        alert("Artikel berhasil dipulihkan dan dipindahkan ke halaman Draft!");
        
        // Refresh tabel
        loadArticles();
    }
}

// ==========================================
// FUNGSI UBAH STATUS (Publish / Keep to Draft)
// ==========================================
function changeStatus(id, newStatus, message) {
    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    let articleIndex = articles.findIndex(article => article.id === id);

    if (articleIndex !== -1) {
        // Ubah status sesuai permintaan tombol
        articles[articleIndex].status = newStatus;
        
        // Simpan pembaruan ke memori
        localStorage.setItem('my_blog_articles', JSON.stringify(articles));
        
        // Munculkan notifikasi
        alert(message);
        
        // Refresh tabel
        loadArticles();
    }
}

// ==========================================
// FUNGSI HAPUS PERMANEN (Permanent Delete)
// ==========================================
function permanentDelete(id) {
    let confirmDelete = confirm("PERINGATAN: Artikel ini akan dihapus secara permanen dan tidak bisa dikembalikan. Lanjutkan?");
    if (!confirmDelete) return;

    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    
    // Filter artikel: Buang artikel yang ID-nya cocok dengan yang mau dihapus
    let filteredArticles = articles.filter(article => article.id !== id);

    // Simpan kembali sisa artikel ke memori
    localStorage.setItem('my_blog_articles', JSON.stringify(filteredArticles));

    alert("Artikel berhasil dihapus secara permanen!");
    
    // Refresh tabel
    loadArticles();
}

// ==========================================
// FUNGSI MEMBUKA HALAMAN EDIT (Poin 1b)
// ==========================================
function editArticle(id) {
    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    let article = articles.find(a => a.id === id);

    if (article) {
        // Masukkan data lama ke dalam form edit
        document.getElementById('editArticleId').value = article.id;
        document.getElementById('editTitle').value = article.title;
        document.getElementById('editCategory').value = article.category;
        document.getElementById('editContent').value = article.content;

        // Pindah ke halaman edit
        switchPage('edit');
    }
}

// ==========================================
// FUNGSI MENYIMPAN HASIL EDITAN
// ==========================================
function saveEditedArticle(status) {
    let id = Number(document.getElementById('editArticleId').value);
    let title = document.getElementById('editTitle').value;
    let category = document.getElementById('editCategory').value;
    let content = document.getElementById('editContent').value;

    if (title.trim() === "" || content.trim() === "") {
        alert("Peringatan: Title dan Content tidak boleh kosong!");
        return;
    }

    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    let index = articles.findIndex(a => a.id === id);

    if (index !== -1) {
        // Timpa data lama dengan data baru
        articles[index].title = title;
        articles[index].category = category;
        articles[index].content = content;
        articles[index].status = status;

        // Simpan kembali ke memori
        localStorage.setItem('my_blog_articles', JSON.stringify(articles));

        alert("Artikel berhasil diperbarui sebagai " + status);
        switchPage('all-posts');
    }
}

// ==========================================
// FUNGSI PREVIEW BLOG & PAGINATION (Poin 3)
// ==========================================
let currentPreviewPage = 1;
const itemsPerPage = 4; // Jumlah artikel yang tampil per halaman (bisa diatur sesuai keinginan)

function loadPreview(page = 1) {
    currentPreviewPage = page;
    let articles = JSON.parse(localStorage.getItem('my_blog_articles')) || [];
    
    // Filter: Hanya ambil artikel yang statusnya 'Published'
    let publishedArticles = articles.filter(article => article.status === 'Published');
    
    const blogContainer = document.getElementById('blogContainer');
    
    if (publishedArticles.length === 0) {
        blogContainer.innerHTML = '<div class="alert alert-warning text-center">Belum ada artikel yang dipublish.</div>';
        return;
    }
    
    // Logika Pagination
    let totalPages = Math.ceil(publishedArticles.length / itemsPerPage);
    let startIndex = (page - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let paginatedArticles = publishedArticles.slice(startIndex, endIndex);
    
    // Render Kartu Artikel Blog
    let html = '';
    paginatedArticles.forEach(article => {
        html += `
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <span class="badge bg-secondary mb-2">${article.category}</span>
                    <h3 class="card-title text-dark">${article.title}</h3>
                    <hr>
                    <p class="card-text text-secondary" style="white-space: pre-line;">${article.content}</p>
                </div>
            </div>
        `;
    });
    
    // Render Tombol Pagination (Bootstrap Pagination)
    let paginationHtml = '';
    if (totalPages > 1) {
        paginationHtml += `<nav class="mt-4"><ul class="pagination justify-content-center">`;
        
        // Tombol Previous
        paginationHtml += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="loadPreview(${page - 1})">Previous</button>
            </li>
        `;
        
        // Tombol Nomor Halaman
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${page === i ? 'active' : ''}">
                    <button class="page-link" onclick="loadPreview(${i})">${i}</button>
                </li>
            `;
        }
        
        // Tombol Next
        paginationHtml += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="loadPreview(${page + 1})">Next</button>
            </li>
        `;
        
        paginationHtml += `</ul></nav>`;
    }
    
    // Gabungkan artikel dan pagination ke dalam container
    blogContainer.innerHTML = html + paginationHtml;
}