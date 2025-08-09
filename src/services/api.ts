import { createClient } from '@supabase/supabase-js'

// 🔹 Configuração do Supabase
const supabaseUrl = 'https://zsceradvdzzhqynfnchh.supabase.co'
const supabaseKey = 'SUA_CHAVE_ANON_KEY_AQUI' // troque pela sua anon key
const supabase = createClient(supabaseUrl, supabaseKey)

// 🔹 Função para buscar os produtos com download_url preenchido
async function getDownloadLinks() {
  const { data, error } = await supabase
    .from('produtos')
    .select('id, name, image_url, download_url')
    .not('download_url', 'is', null) // só pega produtos com link de download

  if (error) {
    console.error('Erro Supabase:', error)
    return []
  }

  return data
}

// 🔹 Exemplo de uso com atualização automática a cada X segundos
async function iniciarBuscaPeriodica(intervaloSegundos = 5) {
  setInterval(async () => {
    const produtos = await getDownloadLinks()
    console.clear()
    console.log('📦 Produtos com link de download:', produtos)
  }, intervaloSegundos * 1000)
}

// Inicia a busca automática
iniciarBuscaPeriodica(5)
