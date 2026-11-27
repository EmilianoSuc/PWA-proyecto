const SUPABASE_URL = 'https://hqdndvarzspxxmivaxct.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZG5kdmFyenNweHhtaXZheGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNzc4NCwiZXhwIjoyMTEzMTM3ODMzfS.7WX1AbRJkKz_9wNymXvAoHW2rb-PwNX2szfPnHrOnP0'

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

async function loadinventario() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, categoria, stock')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error al cargar inventario:', error)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

async function insertProducto(producto) {
  return supabase
    .from('productos')
    .insert({
      nombre: producto.nombre,
      categoria: producto.categoria,
      stock: producto.stock
    })
    .select()
}

async function updateProducto(id, producto) {
  return supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()
}

async function deleteProducto(id) {
  return supabase
    .from('productos')
    .delete()
    .eq('id', id)
}
