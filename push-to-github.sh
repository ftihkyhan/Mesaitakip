#!/usr/bin/env bash
# MesaiTakip PRO - GitHub'a Gönderme Yardımcı Betiği

echo "=================================================="
echo "🚀 MesaiTakip PRO - GitHub Gönderim Aracı"
echo "=================================================="
echo ""

# GitHub repository URL kontrolü
if [ -z "$1" ]; then
    echo "Lütfen GitHub repository bağlantınızı girin:"
    echo "Örnek: https://github.com/kullanici_adiniz/mesaitakip-pro.git"
    read -p "Repository URL: " REPO_URL
else
    REPO_URL=$1
fi

if [ -z "$REPO_URL" ]; then
    echo "❌ Hata: Repository URL belirtilmedi. İşlem iptal edildi."
    exit 1
fi

echo ""
echo "📦 Git konfigürasyonu yapılıyor..."
git branch -M main

# Eski origin varsa kaldır
git remote remove origin 2>/dev/null

# Yeni origin ekle
git remote add origin "$REPO_URL"

echo "📤 Dosyalar GitHub'a aktarılıyor ($REPO_URL)..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tebrikler! MesaiTakip PRO başarıyla GitHub hesabınıza aktarıldı!"
    echo "🔗 Repository: $REPO_URL"
else
    echo ""
    echo "⚠️ Gönderim sırasında bir hata oluştu."
    echo "GitHub kimlik doğrulamanızı kontrol ediniz (Personal Access Token veya SSH anahtarı)."
fi
