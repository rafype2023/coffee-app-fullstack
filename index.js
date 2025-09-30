const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const path = require('path'); // Módulo para manejar rutas de archivos

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuración de SendGrid ---
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API Key configurada.');
} else {
  console.warn('ADVERTENCIA: SENDGRID_API_KEY no encontrada. El envío de emails está deshabilitado.');
}

// --- Middlewares ---
app.use(express.json());
app.use(cors()); // Se puede usar una configuración de CORS más abierta o quitarla si todo es del mismo origen.

// --- Conexión a MongoDB ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR CRÍTICO: La variable de entorno MONGODB_URI no está definida.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas.'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// --- Definición del Modelo de Datos (Schema) ---
const itemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  items: [itemSchema],
  total: { type: Number, required: true },
  verificationCode: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Confirmed'], default: 'Pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// --- Rutas de la API (deben ir antes de servir los archivos estáticos) ---

// 1. Endpoint para CREAR un nuevo pedido con múltiples items
app.post('/api/orders', async (req, res) => {
  try {
    const { employeeName, employeeEmail, items, total } = req.body;

    if (!employeeEmail || !employeeName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Faltan datos en el pedido.' });
    }
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newOrder = new Order({
      employeeName,
      employeeEmail,
      items,
      total,
      verificationCode,
      status: 'Pending'
    });

    await newOrder.save();

    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: employeeEmail,
        from: 'Rafyperez@hotmail.com',
        subject: `Tu código de verificación para Café R&P: ${verificationCode}`,
        html: `...` // El HTML del email va aquí
      };
      sgMail.send(msg).catch(emailError => console.error("Error al enviar el email:", emailError));
    } else {
        console.log(`🔑 (SIMULADO) Código para ${employeeEmail}: ${verificationCode}`);
    }

    res.status(201).json({
      success: true,
      orderId: newOrder._id,
      message: 'Pedido recibido. Por favor, verifica tu email.'
    });

  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// 2. Endpoint para VERIFICAR un pedido
app.post('/api/orders/verify', async (req, res) => {
    // ... Lógica de verificación ...
    const { orderId, code } = req.body;
    if (!orderId || !code) return res.status(400).json({ success: false, message: 'Faltan datos.' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    if (order.verificationCode === code) {
      order.status = 'Confirmed';
      await order.save();
      return res.status(200).json({ success: true, message: 'Pedido confirmado.' });
    } else {
      return res.status(400).json({ success: false, message: 'Código incorrecto.' });
    }
});

// 3. Endpoint para OBTENER pedidos confirmados
app.get('/api/orders/confirmed', async (req, res) => {
    // ... Lógica para obtener pedidos ...
    const confirmedOrders = await Order.find({ status: 'Confirmed' }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(confirmedOrders);
});

// --- Servir Archivos Estáticos del Frontend ---
// Esto le dice a Express que sirva todos los archivos de la carpeta raíz del proyecto.
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// --- Ruta Catch-All ---
// Para cualquier otra petición que no sea una ruta de API, sirve el index.html.
// Esto es crucial para que el enrutamiento del lado del cliente de React funcione.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});