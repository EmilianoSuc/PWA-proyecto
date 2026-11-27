const supabase = window.supabase.createClient('https://hqdndvarzspxxmivaxct.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZG5kdmFyenNweHhtaXZheGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3Mzc3NDMsImV4cCI6MjExMTMxMzc0M30.7WX1AbRJuKz_9wNymXvAoHW2rb-PwNX2szfPnHrOnP0')

// Cargar inventario desde Supabase
async function loadinventario() {
const result = await supabase
.from('inventario')
select('id, nombre, precio, descripcion, duracion, orden, activo') // selecciona sólo lo necesario

console.log(result)

if (result.error) {
console.error('Error al cargar inventario:', result.error)
return
}
inventarioData = Array.isArray(result.data) ? result.data : []
currentPage = 0
renderInventarioPage()
LoadInventarioEnForm() // conserva tu llamada existente si la tienes
}