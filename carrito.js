document.addEventListener('DOMContentLoaded', function () {
    const agregarCarritoBtns = document.querySelectorAll('.agregar-carrito');
    const listaCarrito = document.getElementById('lista-carrito');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const carrito = document.getElementById('carrito');
    const imgCarrito = document.getElementById('img-carrito');
    const cantidadCarrito = document.getElementById('cantidad-carrito');
    const totalCarrito = document.getElementById('total-pagar-valor'); 
    const cantidadCarritoSuperior = document.getElementById('cantidad-carrito-superior');

    let contadorCarrito = 0;
    let totalPrecio = 0;

    // Agregar el evento 'beforeunload' para guardar el carrito antes de que el usuario abandone la página
    window.addEventListener('beforeunload', function(event) {
        guardarCarritoEnStorage();
    });

    listaCarrito.addEventListener('click', function(event) {
        if (event.target.classList.contains('eliminar-producto')) {
            const filaAEliminar = event.target.closest('tr'); 
            if (filaAEliminar) {
                event.stopPropagation();
                eliminarProducto(filaAEliminar);
            }
        }
    });

    // Cargar el carrito desde localStorage al cargar la página
    cargarCarritoDesdeStorage();

    agregarCarritoBtns.forEach(btn => {
        btn.addEventListener('click', agregarAlCarrito);
    });

    vaciarCarritoBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        vaciarCarrito();
    });

    imgCarrito.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleCarrito();
    });

    document.getElementById('procesar-pedido').addEventListener('click', function(event) {
        event.preventDefault(); 
        let mensaje = "Hola Wooly Fruits, deseo comprar:\n";

        document.querySelectorAll('#lista-carrito tbody tr').forEach(function(row) {
            const nombre = row.cells[0].textContent;
            const descripcion = row.cells[1].textContent;
            const precio = parseFloat(row.cells[2].textContent.replace('$', ''));
            const cantidad = parseInt(row.cells[3].querySelector('input').value);
            mensaje += nombre + " - Descripción: " + descripcion + " - Cantidad: " + cantidad + " - Precio: $" + (precio * cantidad).toFixed(2) + "\n";
        });

        const enlaceWhatsApp = "https://wa.me/50769684299?text=" + encodeURIComponent(mensaje);
        window.location.href = enlaceWhatsApp;
    });

    const imagenesProductos = document.querySelectorAll('.product img');
    imagenesProductos.forEach(imagen => {
        imagen.addEventListener('click', function(event) {
            expandirImagen(event.target);
        });
    });

    function expandirImagen(imagen) {
        const contenedorImagen = document.createElement('div');
        contenedorImagen.className = 'imagen-ampliada';
    
        const contenedorImagenInterno = document.createElement('div');
        contenedorImagenInterno.className = 'contenedor-imagen';
    
        const imagenAmpliada = document.createElement('img');
        imagenAmpliada.src = imagen.src;
    
        const botonCerrar = document.createElement('span');
        botonCerrar.className = 'cerrar-imagen';
        botonCerrar.textContent = 'X';
    
        contenedorImagenInterno.appendChild(imagenAmpliada);
        contenedorImagen.appendChild(contenedorImagenInterno);
        contenedorImagen.appendChild(botonCerrar);
    
        document.body.appendChild(contenedorImagen);
    
        botonCerrar.addEventListener('click', function() {
            document.body.removeChild(contenedorImagen);
        });
    }
    
    function agregarAlCarrito(event) {
        event.preventDefault();

        const producto = event.target.parentElement;
        const productoNombre = producto.querySelector('.product-name').innerText;
        const productoDescripcion = producto.querySelector('.product-description').innerText;
        const productoPrecio = parseFloat(producto.querySelector('.product-price').innerText.replace('Precio: $', ''));

        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${productoNombre}</td>
            <td>${productoDescripcion}</td>
            <td>${productoPrecio.toFixed(2)}</td>
            <td><input type="number" value="1" min="1" class="cantidad-input"></td>
            <td><i class="far fa-trash-alt eliminar-producto"></i></td>
        `;

        listaCarrito.querySelector('tbody').appendChild(nuevaFila);

        nuevaFila.addEventListener('click', function (event) {
            event.stopPropagation(); 
        });

        const cantidadInput = nuevaFila.querySelector('.cantidad-input');
        cantidadInput.addEventListener('input', function (event) {
            event.stopPropagation(); 
            calcularTotalCompra();
        });

        const eliminarProductoIcono = nuevaFila.querySelector('.eliminar-producto');
        eliminarProductoIcono.addEventListener('click', function(event) {
            event.stopPropagation(); 
            eliminarProducto(nuevaFila);
            calcularTotalCompra();
        });

        actualizarCarrito(productoPrecio);
        calcularTotalCompra();
    }

    function actualizarCarrito(precioProducto) {
        contadorCarrito++;
        actualizarCantidadCarrito();
        totalPrecio += precioProducto; 
        guardarCarritoEnStorage();
    }

    function eliminarProducto(fila) {
        const cantidad = parseInt(fila.querySelector('.cantidad-input').value);
        const precioProducto = parseFloat(fila.children[2].innerText);

        totalPrecio -= precioProducto * cantidad;
        contadorCarrito -= cantidad;

        actualizarTotalCarrito();
        actualizarCantidadCarrito();

        fila.remove();

        guardarCarritoEnStorage();

        calcularTotalCompra();
    }

    function vaciarCarrito() {
        listaCarrito.querySelector('tbody').innerHTML = '';
        contadorCarrito = 0;
        totalPrecio = 0; 

        actualizarCantidadCarrito();
        actualizarTotalCarrito();

        localStorage.removeItem('carrito');

        calcularTotalCompra();
    }

    function toggleCarrito() {
        carrito.classList.toggle('visible');
    }

    function actualizarCantidadCarrito() {
        if (cantidadCarrito) { 
            if (contadorCarrito > 0) {
                cantidadCarrito.textContent = contadorCarrito;
                cantidadCarrito.style.display = 'inline-block'; 
                if (cantidadCarritoSuperior) {
                    cantidadCarritoSuperior.textContent = contadorCarrito; 
                    cantidadCarritoSuperior.style.display = 'inline-block'; 
                }
            } else {
                cantidadCarrito.style.display = 'none'; 
            }
        }
    }

    function actualizarTotalCarrito() {
        const filasProductos = listaCarrito.querySelectorAll('tbody tr');

        let sumaTotal = 0;

        filasProductos.forEach(fila => {
            const precioUnitario = parseFloat(fila.children[2].textContent); 
            const cantidadProducto = parseInt(fila.querySelector('.cantidad-input').value); 
            const precioTotalProducto = precioUnitario * cantidadProducto; 
            sumaTotal += precioTotalProducto; 
        });

        totalCarrito.textContent = sumaTotal.toFixed(2);
    }

    function calcularTotalCompra() {
        let sumaTotal = 0;

        const filasProductos = listaCarrito.querySelectorAll('tbody tr');

        filasProductos.forEach(fila => {
            const precioProducto = parseFloat(fila.children[2].textContent);
            const cantidadProducto = parseInt(fila.querySelector('.cantidad-input').value);
            const totalProducto = precioProducto * cantidadProducto; 
            sumaTotal += totalProducto; 
        });

        totalCarrito.textContent = sumaTotal.toFixed(2);
    }


    function guardarCarritoEnStorage() {
        const carritoParaGuardar = {
            contador: contadorCarrito,
            total: totalPrecio,
            productos: []
        };

        const filasCarrito = listaCarrito.querySelectorAll('tbody tr');

        filasCarrito.forEach(fila => {
            const nombre = fila.children[0].textContent;
            const descripcion = fila.children[1].textContent;
            const precio = parseFloat(fila.children[2].textContent);
            const cantidad = parseInt(fila.querySelector('.cantidad-input').value);

            carritoParaGuardar.productos.push({
                nombre,
                descripcion,
                precio,
                cantidad 
            });
        });

        localStorage.setItem('carrito', JSON.stringify(carritoParaGuardar));
    }
    function cargarCarritoDesdeStorage() {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            const carritoParseado = JSON.parse(carritoGuardado);

            contadorCarrito = carritoParseado.contador;
            totalPrecio = carritoParseado.total;

            actualizarCantidadCarrito();
           

            carritoParseado.productos.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td><input type="number" value="${producto.cantidad}" min="1" class="cantidad-input"></td>
                    <td><i class="far fa-trash-alt eliminar-producto"></i></td>
                `;
                listaCarrito.querySelector('tbody').appendChild(fila);
            });
            calcularTotalCompra(); // Agrega esta línea para calcular el total del carrito después de cargarlo desde el almacenamiento local
        }
    }

    document.addEventListener('click', function () {
        if (carrito.classList.contains('visible')) {
            carrito.classList.remove('visible');
        }
    });
});
