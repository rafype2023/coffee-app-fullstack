const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND (LA SOLUCIÓN CLAVE) ---
// Esta configuración ahora está al principio. Le dice a Express cómo manejar
// los archivos del frontend antes de hacer cualquier otra cosa.
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    // Si el archivo es .ts o .tsx, envíalo con el tipo MIME de JavaScript.
    // Esto soluciona los errores de "Strict MIME type checking" en el navegador.
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// --- 2. CONFIGURACIÓN Y MIDDLEWARES PARA LA API ---
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API Key configurada.');
} else {
  console.warn('ADVERTENCIA: SENDGRID_API_KEY no encontrada. El envío de emails está deshabilitado.');
}

app.use(express.json());
app.use(cors());

// --- 3. CONEXIÓN A MONGODB ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR CRÍTICO: La variable de entorno MONGODB_URI no está definida.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas.'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// --- 4. DEFINICIÓN DEL MODELO DE DATOS (SCHEMA) ---
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

// --- 5. RUTAS DE LA API ---

// Endpoint para CREAR un nuevo pedido
app.post('/api/orders', async (req, res) => {
  try {
    const { employeeName, employeeEmail, items, total } = req.body;
    if (!employeeEmail || !employeeName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Faltan datos en el pedido.' });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOrder = new Order({ employeeName, employeeEmail, items, total, verificationCode, status: 'Pending' });
    await newOrder.save();

    if (process.env.SENDGRID_API_KEY) {
      const emailBody = `<h1>Confirmación de tu pedido en Café R&P</h1><p>Hola ${employeeName},</p><p>Gracias por tu pedido. Para confirmarlo, por favor usa el siguiente código de verificación:</p><h2 style="font-size: 24px; letter-spacing: 5px; text-align: center; background-color: #f2f2f2; padding: 10px;">${verificationCode}</h2><p><strong>Detalles del pedido:</strong></p><ul>${items.map(item => `<li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}</ul><p><strong>Total: $${total.toFixed(2)}</strong></p><p>¡Gracias!</p>`;
      const msg = { to: employeeEmail, from: 'Rafyperez@hotmail.com', subject: `Tu código de verificación para Café R&P: ${verificationCode}`, html: emailBody };
      sgMail.send(msg).catch(emailError => console.error("Error al enviar el email:", emailError.response ? emailError.response.body : emailError));
    } else {
      console.log(`🔑 (SIMULADO) Código para ${employeeEmail}: ${verificationCode}`);
    }
    res.status(201).json({ success: true, orderId: newOrder._id, message: 'Pedido recibido. Por favor, verifica tu email.' });
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// Endpoint para VERIFICAR un pedido
app.post('/api/orders/verify', async (req, res) => {
    const { orderId, code } = req.body;
    if (!orderId || !code) return res.status(400).json({ success: false, message: 'Faltan datos para la verificación.' });
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
        if (order.status === 'Confirmed') return res.status(400).json({ success: false, message: 'Este pedido ya ha sido confirmado.' });
        if (order.verificationCode === code) {
          order.status = 'Confirmed';
          await order.save();
          return res.status(200).json({ success: true, message: 'Pedido confirmado exitosamente.' });
        } else {
          return res.status(400).json({ success: false, message: 'El código de verificación es incorrecto.' });
        }
    } catch(error) {
        console.error("Error al verificar el pedido:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Endpoint para OBTENER pedidos confirmados
app.get('/api/orders/confirmed', async (req, res) => {
    try {
        const confirmedOrders = await Order.find({ status: 'Confirmed' }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(confirmedOrders);
    } catch(error) {
        console.error("Error al obtener pedidos confirmados:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// --- 6. RUTA CATCH-ALL ---
// Para cualquier otra petición que no sea una ruta de API ni un archivo estático, sirve el index.html.
// Esto es crucial para que el enrutamiento del lado del cliente de React funcione.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 7. INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
