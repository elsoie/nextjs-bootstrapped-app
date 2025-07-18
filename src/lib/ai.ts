export interface AIPrompt {
  cropType: string;
  landArea: number;
  soilType?: string;
  season?: string;
  location?: string;
}

export async function generateDraftKebutuhan(prompt: AIPrompt): Promise<string> {
  // Retrieve API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("API key OpenRouter belum dikonfigurasi. Silakan tambahkan NEXT_PUBLIC_OPENROUTER_API_KEY ke file .env.local");
  }

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  
  // Create detailed prompt for agricultural planning
  const systemPrompt = `Anda adalah ahli pertanian yang berpengalaman dalam perencanaan tanam. Berikan rekomendasi detail mengenai kebutuhan pertanian berdasarkan informasi yang diberikan. Format jawaban dalam bentuk yang terstruktur dan mudah dipahami.`;
  
  const userPrompt = `Saya ingin menanam ${prompt.cropType} di lahan seluas ${prompt.landArea} hektar${prompt.soilType ? ` dengan jenis tanah ${prompt.soilType}` : ''}${prompt.season ? ` pada musim ${prompt.season}` : ''}${prompt.location ? ` di daerah ${prompt.location}` : ''}.

Tolong berikan rekomendasi detail untuk:
1. Kebutuhan bibit/benih (jumlah dan jenis)
2. Kebutuhan pupuk (jenis, jumlah, dan jadwal aplikasi)
3. Kebutuhan pestisida/fungisida (jenis dan dosis)
4. Kebutuhan air/irigasi
5. Jadwal tanam dan perawatan
6. Estimasi biaya per kategori
7. Perkiraan hasil panen
8. Tips khusus untuk tanaman ini

Format jawaban dengan jelas dan berikan angka yang spesifik.`;

  const payload = {
    model: "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        "X-Title": "Sistem Manajemen Pertanian"
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error dari AI API: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const aiOutput = data?.choices?.[0]?.message?.content;
    
    if (!aiOutput) {
      throw new Error("Tidak ada output dari AI API. Silakan coba lagi.");
    }
    
    return aiOutput;
  } catch (error) {
    console.error("AI generation error:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Terjadi kesalahan saat menggenerate draft kebutuhan. Silakan coba lagi.");
  }
}

// Function to validate AI prompt input
export function validateAIPrompt(prompt: AIPrompt): string | null {
  if (!prompt.cropType || prompt.cropType.trim().length === 0) {
    return "Jenis tanaman harus diisi";
  }
  
  if (!prompt.landArea || prompt.landArea <= 0) {
    return "Luas lahan harus lebih dari 0";
  }
  
  if (prompt.landArea > 10000) {
    return "Luas lahan terlalu besar (maksimal 10,000 hektar)";
  }
  
  return null;
}

// Default system prompt that can be customized by users
export const DEFAULT_SYSTEM_PROMPT = `Anda adalah ahli pertanian yang berpengalaman dalam perencanaan tanam. Berikan rekomendasi detail mengenai kebutuhan pertanian berdasarkan informasi yang diberikan. Format jawaban dalam bentuk yang terstruktur dan mudah dipahami dengan poin-poin yang jelas.

Selalu sertakan:
- Kebutuhan bibit/benih dengan jumlah spesifik
- Jenis dan jumlah pupuk yang dibutuhkan
- Jadwal perawatan yang detail
- Estimasi biaya untuk setiap kategori
- Perkiraan hasil panen
- Tips praktis untuk sukses budidaya

Berikan jawaban dalam bahasa Indonesia yang mudah dipahami oleh petani.`;
