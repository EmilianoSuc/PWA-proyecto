const form = document.querySelector('#product-form')
const productList = document.querySelector('#product-list')
const notice = document.querySelector('#notice')
const connectionStatus = document.querySelector('#connection-status')
const refreshButton = document.querySelector('#refresh-button')
const installButton = document.querySelector('#install-button')
const dataStatus = document.querySelector('#data-status')
const LOW_STOCK_LIMIT = 5

let products = []
let installPrompt = null
let busy = false

function showNotice(message = '', type = '') {
  notice.textContent = message
  notice.className = `notice ${type}`.trim()
}

function updateConnectionStatus() {
  const online = navigator.onLine
  connectionStatus.classList.toggle('online', online)
  connectionStatus.classList.toggle('offline', !online)
  connectionStatus.lastElementChild.textContent = online ? 'En línea' : 'Sin conexión'

  form.querySelectorAll("input, button[type='submit']").forEach(control => {
    control.disabled = !online || busy
  })

  productList.querySelectorAll('producto-card').forEach(card => {
    card.disabled = !online || busy
  })

  dataStatus.textContent = online
    ? 'Los cambios se guardan en la base de datos.'
    : 'Modo sin conexión: consulta disponible; cambios pausados.'
}

function updateSummary(items) {
  document.querySelector('#total-products').textContent = String(items.length)
  document.querySelector('#total-stock').textContent = String(
    items.reduce((total, product) => total + Number(product.stock || 0), 0)
  )
  document.querySelector('#low-stock').textContent = String(
    items.filter(product => Number(product.stock) <= LOW_STOCK_LIMIT).length
  )
}

function renderProducts(items) {
  productList.replaceChildren()
  updateSummary(items)

  if (items.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'

    const title = document.createElement('strong')
    title.textContent = 'Aún no hay productos'

    const hint = document.createElement('span')
    hint.textContent = 'Agrega el primero con el formulario.'

    empty.append(title, hint)
    productList.append(empty)
    updateConnectionStatus()
    return
  }

  items.forEach(product => {
    const card = document.createElement('producto-card')
    card.producto = product
    card.disabled = !navigator.onLine || busy
    productList.append(card)
  })

  updateConnectionStatus()
}

async function loadProducts() {
  showNotice('Cargando inventario…')
  refreshButton.disabled = true

  try {
    const { data, error } = await loadinventario()

    if (error) throw error

    products = data
    localStorage.setItem('inventario-productos', JSON.stringify(products))
    renderProducts(products)
    showNotice(
      products.length ? 'Inventario actualizado.' : 'No hay productos registrados todavía.',
      'success'
    )
  } catch (error) {
    console.error(error)
    showNotice(error.message || 'No se pudo cargar el inventario.', 'error')
  } finally {
    refreshButton.disabled = false
    updateConnectionStatus()
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault()

  if (!navigator.onLine || busy) {
    showNotice('Conéctate a internet para guardar cambios.', 'warning')
    return
  }

  const stockText = document.querySelector('#product-stock').value.trim()
  const product = {
    nombre: document.querySelector('#product-name').value.trim(),
    categoria: document.querySelector('#product-category').value.trim(),
    stock: Number(stockText)
  }

  if (
    !product.nombre ||
    !product.categoria ||
    !stockText ||
    !Number.isInteger(product.stock) ||
    product.stock < 0
  ) {
    showNotice('Revisa los campos. El nombre, la categoría y un stock entero no negativo son obligatorios.', 'error')
    return
  }

  busy = true
  updateConnectionStatus()

  try {
    const { error } = await insertProducto(product)
    if (error) throw error

    form.reset()
    showNotice('Producto agregado correctamente.', 'success')
    await loadProducts()
  } catch (error) {
    console.error(error)
    showNotice(error.message || 'No se pudo agregar el producto.', 'error')
  } finally {
    busy = false
    updateConnectionStatus()
  }
})

productList.addEventListener('producto-accion', async event => {
  const { action, id } = event.detail
  const product = products.find(item => Number(item.id) === Number(id))

  if (!product) return

  if (!navigator.onLine || busy) {
    showNotice('Los cambios de existencias requieren conexión con el servidor.', 'warning')
    return
  }

  if (action === 'eliminar' && !window.confirm(`¿Eliminar “${product.nombre}” del inventario?`)) return

  busy = true
  updateConnectionStatus()

  try {
    if (action === 'eliminar') {
      const { error } = await deleteProducto(Number(id))
      if (error) throw error
    } else {
      const stock = Number(product.stock) + (action === 'sumar' ? 1 : -1)

      if (stock < 0) {
        showNotice('Las existencias no pueden ser negativas.', 'warning')
        return
      }

      const { error } = await updateProducto(Number(id), {
        nombre: product.nombre,
        categoria: product.categoria,
        stock
      })

      if (error) throw error
    }

    showNotice(action === 'eliminar' ? 'Producto eliminado.' : 'Existencias actualizadas.', 'success')
    await loadProducts()
  } catch (error) {
    console.error(error)
    showNotice(error.message || 'No se pudo completar la operación.', 'error')
  } finally {
    busy = false
    updateConnectionStatus()
  }
})

refreshButton.addEventListener('click', loadProducts)

window.addEventListener('online', () => {
  updateConnectionStatus()
  loadProducts()
})

window.addEventListener('offline', () => {
  updateConnectionStatus()
  showNotice('Modo sin conexión: los cambios estarán pausados.', 'warning')
})

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  installPrompt = event
  installButton.hidden = false
})

installButton.addEventListener('click', async () => {
  if (!installPrompt) return
  installPrompt.prompt()
  await installPrompt.userChoice
  installPrompt = null
  installButton.hidden = true
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('service-worker.js')
      console.info('Service Worker registrado.')
    } catch (error) {
      console.error('No se pudo registrar el Service Worker:', error)
      showNotice('La aplicación funciona, pero el Service Worker no pudo registrarse.', 'warning')
    }
  })
}

updateConnectionStatus()
loadProducts()
