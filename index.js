const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os'); // Untuk CPU Load
let requestCount = 0; // Untuk menghitung request

const app = express();
const server = http.createServer(app); // Membuat server HTTP
const io = socketIo(server); // Menghubungkan socket.io ke server HTTP

const PORT = process.env.PORT || 4000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {
            const responseData = {
                status: data.status,
                creator: settings.apiSettings.creator || "Created Using Rynn UI",
                ...data
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    next();
});

// API Route
let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');
fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
        fs.readdirSync(subfolderPath).forEach((file) => {
            const filePath = path.join(subfolderPath, file);
            if (path.extname(file) === '.js') {
                require(filePath)(app);
                totalRoutes++;
                console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${path.basename(file)} `));
            }
        });
    }
});
console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

// Monitoring Route
app.get('/monitoring', (req, res) => {
    const routes = [];

    // Looping untuk mendapatkan daftar API Routes yang ada
    fs.readdirSync(apiFolder).forEach((subfolder) => {
        const subfolderPath = path.join(apiFolder, subfolder);
        if (fs.statSync(subfolderPath).isDirectory()) {
            fs.readdirSync(subfolderPath).forEach((file) => {
                const filePath = path.join(subfolderPath, file);
                if (path.extname(file) === '.js') {
                    routes.push({
                        path: `/src/api/${subfolder}/${file}`,
                        status: 'Active' // Status bisa ditentukan berdasarkan hasil cek tertentu
                    });
                }
            });
        }
    });

    const status = {
        serverStatus: 'Online', // Kamu bisa menyesuaikan ini dengan pengecekan server atau kondisi lainnya
        time: new Date().toLocaleString(),
        apiRoutes: routes
    };

    res.json(status);
});

// Halaman Utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

// Menangani 404 dan error
app.use((req, res, next) => {
    res.status(404).sendFile(process.cwd() + "/api-page/404.html");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(process.cwd() + "/api-page/500.html");
});

// WebSocket untuk real-time monitoring
setInterval(() => {
    const uptime = Math.floor(process.uptime()); // Menghitung uptime dalam detik
    const cpuLoad = os.loadavg()[0]; // CPU load 1 menit terakhir (0, 1, 5 menit avg)

    // Mengirim data monitoring melalui Socket.io
    io.emit('monitoringUpdate', {
        uptime: formatUptime(uptime),
        cpuLoad: cpuLoad.toFixed(2),
        requestCount: requestCount
    });

}, 5000); // Update setiap 5 detik

// Fungsi untuk format uptime dalam format yang lebih mudah dibaca
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = seconds % 60;
    return `${hours}h ${minutes}m ${secondsRemaining}s`;
}

// Menghitung request count
app.use((req, res, next) => {
    requestCount++;
    next();
});

// Menjalankan server dengan socket.io
server.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;
