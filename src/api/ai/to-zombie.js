const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * Fungsi untuk mengubah gambar menjadi zombie
 * @async
 * @function toZombie
 * @param {string} url - URL gambar yang akan diproses
 * @returns {Promise<Buffer>} Promise yang mengembalikan buffer gambar zombie
 * @throws {Error} Menghasilkan error jika ada langkah yang gagal
 */
async function toZombie(url) {
    const fetchImage = async () => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.arrayBuffer();
    };

    const uploadImage = async (imageBuffer) => {
        const formData = new FormData();
        formData.append("photofile", Buffer.from(imageBuffer), {
            filename: "image.jpg",
            contentType: "image/jpeg",
        });
        formData.append("action", "upload");

        const response = await fetch("https://makemezombie.com/response.php", {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json",
                Origin: "https://makemezombie.com",
                Referer: "https://makemezombie.com/",
            },
        });

        const text = await response.text(); // Ambil respons sebagai teks
        console.log("Upload Response Text:", text); // Log respons

        let result;
        try {
            result = JSON.parse(text); // Coba parsing JSON
        } catch (error) {
            throw new Error("Failed to parse JSON response");
        }

        if (!result.ok) throw new Error("Upload failed");
        return result.key;
    };

    const checkProcessing = async (imageId) => {
        const response = await fetch("https://makemezombie.com/response.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                Origin: "https://makemezombie.com",
                Referer: `https://makemezombie.com/processing?image_id=${imageId}`,
            },
            body: `action=check&image_id=${imageId}`,
        });

        const text = await response.text(); // Ambil respons sebagai teks
        console.log("Check Processing Response Text:", text); // Log respons

        let result;
        try {
            result = JSON.parse(text); // Coba parsing JSON
        } catch (error) {
            throw new Error("Failed to parse JSON response");
        }

        if (!result.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return result.result_url;
    };

    const imageBuffer = await fetchImage();
    const imageId = await uploadImage(imageBuffer);
    const zombieImageUrl = await checkProcessing(imageId);

    // Ambil gambar zombie dari URL
    const zombieImageResponse = await fetch(zombieImageUrl);
    if (!zombieImageResponse.ok) {
        throw new Error(`Failed to fetch zombie image! status: ${zombieImageResponse.status}`);
    }
    return await zombieImageResponse.buffer(); // Kembalikan buffer gambar zombie
}

// Fungsi untuk mengatur API
module.exports = function (app) {
    app.get('/ai/toZombie', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query string

        if (!url) {
            return res.status(400).json({ error: "Query parameter 'url' is required" });
        }

        try {
            const zombieImageBuffer = await toZombie(url);
            res.set('Content-Type', 'image/jpeg'); // Set header untuk gambar
            res.status(200).send(zombieImageBuffer); // Kirim gambar sebagai respons
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: error.message });
        }
    });
};
