// Öğretmen isimlerini çek ve açılır listeye ekle
async function fetchTeachers() {
    const { data, error } = await supabase
        .from('teachers')
        .select('name');

    if (error) {
        console.error('Hata:', error);
        return;
    }

    const selectElement = document.getElementById('teacher-select');
    data.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.name; // Öğretmen adını value olarak kullan
        option.textContent = teacher.name;
        selectElement.appendChild(option);
    });
}

// TC Kimlik No kontrolü ve veri çekme
async function checkAndFetchData() {
    const tcInput = document.getElementById('tc-input').value;
    const selectedTeacher = document.getElementById('teacher-select').value;

    if (tcInput.length !== 11 || isNaN(tcInput)) {
        alert('Lütfen 11 haneli bir TC Kimlik No giriniz.');
        return;
    }

    // TC Kimlik No ve öğretmen adı doğrulama
    const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('tc_no, name')
        .eq('name', selectedTeacher)
        .eq('tc_no', tcInput);

    if (teacherError || teacherData.length === 0) {
        alert('TC Kimlik No yanlış veya öğretmen bulunamadı.');
        return;
    }

    // Kullanıcı bilgilerini göster
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.innerHTML = `<p>Giriş Yapan: ${teacherData[0].name} - TC: ${teacherData[0].tc_no}</p>`;
    userInfoDiv.style.display = 'block';

    // Giriş alanlarını gizle
    document.querySelector('section').style.display = 'none';

    // Devlet desteği verilerini çekme ve id'ye göre sıralama
    const { data, error } = await supabase
        .from('devlet_destegi')
        .select('*')
        .eq('ogretmen_adi', selectedTeacher)
        .order('id', { ascending: true });

    if (error) {
        console.error('Hata:', error);
        return;
    }

    if (data.length === 0) {
        alert('Bu öğretmen için veri bulunamadı.');
        return;
    }

    // Tablo ve butonu göster
    document.getElementById('data-section').style.display = 'block';

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Önceki verileri temizle

    data.forEach(row => {
        const tr = document.createElement('tr');
        const isChecked = row.odeme_evragi_durumu === "Ödeme Evrağı Teslim Edildi";
        tr.innerHTML = `
            <td>${row.isletme_adi}</td>
            <td>${row.ad_soyad}</td>
            <td>${row.kimlik_no}</td>
            <td>${row.ucret}</td>
            <td>
                <input type="checkbox" onchange="updateMessage(this)" ${isChecked ? 'checked' : ''} />
                <span class="message">${row.odeme_evragi_durumu || "Ödeme Evrağı Zamanında Teslim Edilmedi"}</span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Onay kutusu değiştiğinde mesajı güncelle
function updateMessage(checkbox) {
    const messageSpan = checkbox.nextElementSibling;
    if (checkbox.checked) {
        messageSpan.textContent = "Ödeme Evrağı Teslim Edildi";
    } else {
        messageSpan.textContent = "Ödeme Evrağı Zamanında Teslim Edilmedi";
    }
}

// Ekranı kaydet ve veritabanını güncelle
async function saveScreen() {
    const rows = document.querySelectorAll('#tableBody tr');
    let hasError = false;

    for (const row of rows) {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const message = checkbox.checked ? "Ödeme Evrağı Teslim Edildi" : "Ödeme Evrağı Zamanında Teslim Edilmedi";
        const kimlikNo = row.children[2].textContent;

        // Veritabanını güncelle
        const { error } = await supabase
            .from('devlet_destegi')
            .update({ odeme_evragi_durumu: message })
            .eq('kimlik_no', kimlikNo);

        if (error) {
            console.error('Güncelleme hatası:', error.message, 'Kimlik No:', kimlikNo, 'Mesaj:', message);
            hasError = true;
        }
    }

    if (!hasError) {
        const message = document.createElement('div');
        message.textContent = 'EKRAN KAYDETME BAŞARILI';
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.backgroundColor = '#4caf50';
        message.style.color = 'white';
        message.style.padding = '20px 40px';
        message.style.borderRadius = '10px';
        message.style.zIndex = '1000';
        message.style.fontSize = '1.5em';
        message.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
            document.getElementById('data-section').style.display = 'none'; // Tabloyu gizle
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Sayfanın en başına dön
        }, 2000);
    }
}

// Ay adlarını Türkçe olarak tanımla
const aylar = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// Sayfa yüklendiğinde başlığı güncelle
function updatePageTitle() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const titleElement = document.getElementById('page-title');
    titleElement.textContent = `KAVLAKLI MESEM ${aylar[previousMonth].toUpperCase()} AYI DEKONT TAKİBİ`;
    titleElement.style.textAlign = 'center'; // Başlığı ortala
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTeachers();
    updatePageTitle(); // Başlığı güncelle
});

document.getElementById('login-button').addEventListener('click', checkAndFetchData);
document.getElementById('save-screen-button').addEventListener('click', saveScreen);