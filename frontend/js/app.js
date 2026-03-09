// ─────────────────────────────────────────────────────────────────────────────
//  Sistema de Gestión para Tienda de Barrio
//  Frontend: Angular
//  Autor: Keidy Mercado Sierra — SENA
// ─────────────────────────────────────────────────────────────────────────────

const API = 'https://sistema-de-gestion-para-tienda-de-barrio.onrender.com/api';   // <── cambia si despliegas el backend en otra URL

angular.module('tiendaApp', [])

// ── Filtro de fecha ──────────────────────────────────────────────────────────
.filter('date', function () {
  return function (value, format) {
    if (!value) return '';
    const d = new Date(value);
    if (format === 'dd/MM/yyyy HH:mm') {
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return d.toLocaleDateString('es-CO');
  };
})

// ── Controlador principal ────────────────────────────────────────────────────
.controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {

  // Estado de la vista actual
  $scope.vista       = 'dashboard';
  $scope.productos   = [];
  $scope.ventas      = [];
  $scope.clientes    = [];
  $scope.productosAlerta = [];

  // ── Navegación ─────────────────────────────────────────────────────────────
  $scope.setVista = function (v) {
    $scope.vista = v;
    // Cerrar sidenav si estaba abierto
    const inst = M.Sidenav.getInstance(document.getElementById('sidenav'));
    if (inst) inst.close();
  };

  // ── Toast helper ───────────────────────────────────────────────────────────
  function toast(msg, classes) {
    M.toast({ html: msg, classes: classes || 'teal darken-2', displayLength: 3000 });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  PRODUCTOS
  // ══════════════════════════════════════════════════════════════════════════
  $scope.cargarProductos = function () {
    $http.get(`${API}/productos`).then(r => {
      $scope.productos = r.data.data;
      $scope.productosAlerta = $scope.productos.filter(p => p.stock <= p.stockMinimo);
    }).catch(() => toast('Error cargando productos', 'red'));
  };

  $scope.formProducto = {};

  $scope.abrirModalProducto = function (p) {
    $scope.formProducto = p ? angular.copy(p) : { stockMinimo: 5 };
    const modal = M.Modal.getInstance(document.getElementById('modalProducto'));
    modal.open();
    // Re-inicializar labels de Materialize
    setTimeout(() => M.updateTextFields(), 200);
  };

  $scope.guardarProducto = function () {
    const fp = $scope.formProducto;
    if (!fp.nombre || !fp.categoria || fp.precio == null || fp.stock == null) {
      return toast('Completa los campos obligatorios', 'orange darken-2');
    }
    const req = fp._id
      ? $http.put(`${API}/productos/${fp._id}`, fp)
      : $http.post(`${API}/productos`, fp);

    req.then(() => {
      toast(fp._id ? 'Producto actualizado ✓' : 'Producto creado ✓');
      M.Modal.getInstance(document.getElementById('modalProducto')).close();
      $scope.cargarProductos();
    }).catch(e => toast('Error: ' + (e.data?.error || e.statusText), 'red'));
  };

  $scope.eliminarProducto = function (id) {
    if (!confirm('¿Eliminar este producto?')) return;
    $http.delete(`${API}/productos/${id}`).then(() => {
      toast('Producto eliminado');
      $scope.cargarProductos();
    }).catch(() => toast('Error eliminando producto', 'red'));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  VENTAS
  // ══════════════════════════════════════════════════════════════════════════
  $scope.cargarVentas = function () {
    $http.get(`${API}/ventas`).then(r => {
      $scope.ventas = r.data.data;
    }).catch(() => toast('Error cargando ventas', 'red'));
  };

  $scope.carritoVenta = [];
  $scope.itemTemp     = { cantidad: 1 };
  $scope.formVenta    = { tipoPago: 'efectivo' };

$scope.abrirModalVenta = function () {
  $scope.carritoVenta = [];
  $scope.itemTemp     = { cantidad: 1 };
  $scope.formVenta    = { tipoPago: 'efectivo' };
  const modal = M.Modal.getInstance(document.getElementById('modalVenta'));
  modal.open();
  setTimeout(() => {
    M.FormSelect.init(document.querySelectorAll('select'));
    M.updateTextFields();
  }, 300);
};

  $scope.agregarItemVenta = function () {
    const { productoId, cantidad } = $scope.itemTemp;
    if (!productoId || !cantidad || cantidad < 1) return toast('Selecciona producto y cantidad', 'orange');
    const prod = $scope.productos.find(p => p._id === productoId);
    if (!prod) return;
    const exist = $scope.carritoVenta.find(i => i.producto === prod._id);
    if (exist) { exist.cantidad += parseInt(cantidad); exist.subtotal = exist.cantidad * exist.precioUnit; }
    else $scope.carritoVenta.push({ producto: prod._id, nombre: prod.nombre, cantidad: parseInt(cantidad), precioUnit: prod.precio, subtotal: prod.precio * parseInt(cantidad) });
    $scope.itemTemp = { cantidad: 1 };
  };

  $scope.quitarItemVenta = function (idx) { $scope.carritoVenta.splice(idx, 1); };

  $scope.totalVenta = function () { return $scope.carritoVenta.reduce((s, i) => s + i.subtotal, 0); };

  $scope.registrarVenta = function () {
    if ($scope.carritoVenta.length === 0) return toast('Agrega al menos un producto', 'orange');
    const payload = {
      items: $scope.carritoVenta,
      tipoPago: $scope.formVenta.tipoPago,
      cliente: $scope.formVenta.tipoPago === 'credito' ? $scope.formVenta.clienteId : null
    };
    $http.post(`${API}/ventas`, payload).then(() => {
      toast('Venta registrada ✓');
      M.Modal.getInstance(document.getElementById('modalVenta')).close();
      $scope.cargarVentas();
      $scope.cargarProductos();  // refresca stock
    }).catch(e => toast('Error: ' + (e.data?.error || e.statusText), 'red'));
  };

  $scope.eliminarVenta = function (id) {
    if (!confirm('¿Anular esta venta?')) return;
    $http.delete(`${API}/ventas/${id}`).then(() => {
      toast('Venta anulada');
      $scope.cargarVentas();
    }).catch(() => toast('Error anulando venta', 'red'));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  CLIENTES
  // ══════════════════════════════════════════════════════════════════════════
  $scope.cargarClientes = function () {
    $http.get(`${API}/clientes`).then(r => {
      $scope.clientes = r.data.data;
    }).catch(() => toast('Error cargando clientes', 'red'));
  };

  $scope.formCliente = {};

  $scope.abrirModalCliente = function (c) {
    $scope.formCliente = c ? angular.copy(c) : {};
    const modal = M.Modal.getInstance(document.getElementById('modalCliente'));
    modal.open();
    setTimeout(() => M.updateTextFields(), 200);
  };

  $scope.guardarCliente = function () {
    const fc = $scope.formCliente;
    if (!fc.nombre) return toast('El nombre es obligatorio', 'orange');
    const req = fc._id
      ? $http.put(`${API}/clientes/${fc._id}`, fc)
      : $http.post(`${API}/clientes`, fc);

    req.then(() => {
      toast(fc._id ? 'Cliente actualizado ✓' : 'Cliente creado ✓');
      M.Modal.getInstance(document.getElementById('modalCliente')).close();
      $scope.cargarClientes();
    }).catch(e => toast('Error: ' + (e.data?.error || e.statusText), 'red'));
  };

  $scope.eliminarCliente = function (id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    $http.delete(`${API}/clientes/${id}`).then(() => {
      toast('Cliente eliminado');
      $scope.cargarClientes();
    }).catch(() => toast('Error eliminando cliente', 'red'));
  };

  // ── Inicialización ─────────────────────────────────────────────────────────
  function init() {
    // Inicializar componentes Materialize
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    M.Modal.init(document.querySelectorAll('.modal'));
    M.FormSelect.init(document.querySelectorAll('select'));

    // Cargar datos desde la API
    $scope.cargarProductos();
    $scope.cargarVentas();
    $scope.cargarClientes();
  }

  init();
}]);
