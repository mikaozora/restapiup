const express = require("express")
const app = express()
const multer = require("multer") // untuk upload file
const path = require("path") // untuk memanggil path direktori
const fs = require("fs") // untuk manajemen file
const mysql = require("mysql")
const cors = require("cors")
const moment = require("moment")
const { equal } = require("assert")
const e = require("express")
const { count } = require("console")

app.use(express.static(__dirname));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // set file storage
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        // generate file name 
        cb(null, "image-" + Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({ storage: storage })

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "olshop"
})

// endpoint untuk menambah data barang baru
app.post("/barang", upload.single("image"), (req, res) => {
    // prepare data
    let data = {
        nama_barang: req.body.nama_barang,
        harga: req.body.harga,
        stok: req.body.stok,
        deskripsi: req.body.deskripsi,
        image: req.file.filename
    }

    if (!req.file) {
        // jika tidak ada file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        // create sql insert
        let sql = "insert into barang set ?"

        // run query
        db.query(sql, data, (error, result) => {
            if (error) throw error
            res.json({
                message: result.affectedRows + " data berhasil disimpan"
            })
        })
    }
})

// endpoint untuk mengubah data barang
app.put("/barang", upload.single("image"), (req, res) => {
    let data = null, sql = null
    // paramter perubahan data
    let param = { kode_barang: req.body.kode_barang }

    if (!req.file) {
        // jika tidak ada file yang dikirim = update data saja
        data = {
            nama_barang: req.body.nama_barang,
            harga: req.body.harga,
            stok: req.body.stok,
            deskripsi: req.body.deskripsi
        }
    } else {
        // jika mengirim file = update data + reupload
        data = {
            nama_barang: req.body.nama_barang,
            harga: req.body.harga,
            stok: req.body.stok,
            deskripsi: req.body.deskripsi,
            image: req.file.filename
        }

        // get data yg akan diupdate utk mendapatkan nama file yang lama
        sql = "select * from barang where ?"
        // run query
        db.query(sql, param, (err, result) => {
            if (err) throw err
            // tampung nama file yang lama
            let fileName = result[0].image

            // hapus file yg lama
            let dir = path.join(__dirname, "image", fileName)
            fs.unlink(dir, (error) => { })
        })

    }

    // create sql update
    sql = "update barang set ? where ?"

    // run sql update
    db.query(sql, [data, param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})

// endpoint untuk menghapus data barang
app.delete("/barang/:kode_barang", (req, res) => {
    let param = { kode_barang: req.params.kode_barang }

    // ambil data yang akan dihapus
    let sql = "select * from barang where ?"
    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // tampung nama file yang lama
        let fileName = result[0].image

        // hapus file yg lama
        let dir = path.join(__dirname, "image", fileName)
        fs.unlink(dir, (error) => { })
    })

    // create sql delete
    sql = "delete from barang where ?"
    // run query
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }
    })
})

// endpoint ambil data barang
app.get("/barang", (req, res) => {
    // create sql query
    let sql = "select * from barang"

    // run query
    db.query(sql, (error, result) => {
        if (error) throw error
        res.json({
            data: result,
            count: result.length
        })
    })
})



// tabel admin
app.post("/admin", (req, res) => {
    let data = {
        id_admin: req.body.id_admin,
        nama_admin: req.body.nama_admin,
        username: req.body.username,
        password: req.body.password
    }
    let sql = "insert into admin set ?"
    db.query(sql, data, (error, result) => {
        if (error) throw error
        res.json({
            message: result.affectedRows + " berhasil ditambahkan"
        })
    })
})

app.put("/admin", (req, res) => {
    let data = [
        {
            nama_admin: req.body.nama_admin,
            username: req.body.username,
            password: req.body.password
        },
        {
            id_admin: req.body.id_admin
        }
    ]
    let sql = "update admin set? where ?"
    db.query(sql, data, (error, result) => {
        if (error) throw error
        res.json({
            message: result.affectedRows + " berhasil diupdate"
        })
    })
})

app.delete("/admin/:id", (req, res) => {
    let data = {
        id_admin: req.params.id
    }
    let sql = "delete from admin where ?"
    db.query(sql, data, (error, result) => {
        if (error) throw error
        res.json({
            message: result.affectedRows + " berhasil dihapus"
        })
    })
})

app.get("/admin", (req, res) => {
    let sql = "select * from admin"
    db.query(sql, (error, result) => {
        if (error) throw error
        res.json({
            data: result,
            count: result.length
        })
    })
})

app.post("/users", upload.single("foto"), (req, res) => {
    let data = {
        id_users: req.body.id_users,
        nama_users: req.body.nama_users,
        alamat: req.body.alamat,
        foto: req.file.filename,
        username: req.body.username,
        password: req.body.password
    }
    if (!req.file) {
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        let sql = "insert into users set ?"
        db.query(sql, data, (error, result) => {
            if (error) throw error
            res.json({
                message: result.affectedRows + " berhasil ditambahkan"
            })
        })
    }
})
app.put("/users", upload.single("foto"), (req, res) => {
    let data = null
    let sql = null
    let param = {
        id_users: req.body.id_users
    }
    if (!req.file) {
        // jika tidak ada file yang dikirim = update data saja
        data = {
            nama_users: req.body.nama_users,
            alamat: req.body.alamat,
            username: req.body.username,
            password: req.body.password
        }
    } else {
        // jika mengirim file = update data + reupload
        data = {
            nama_users: req.body.nama_users,
            alamat: req.body.alamat,
            foto: req.body.foto,
            username: req.body.username,
            password: req.body.password
        }
        // get data yang akan diupdate utk mendapatkan nama file yang lama
        sql = "select * from users where ?"
        // run query
        db.query(sql, param, (error, result) => {
            if (error) throw error
            //tampung nama file yang lama
            let filename = result[0].foto
            //hapus file yang lama
            let dir = path.join(__dirname, "foto", filename)
            fs.unlink(dir, (error) => { })
        })
    }
    sql = "update users set ? where ?"
    db.query(sql, [data, param], (error, result) => {
        if (error) throw error
        res.json({
            message: result.affectedRows + " berhasil diupdate"
        })
    })
})
app.delete("/users/:id", upload.single("foto"), (req, res) => {
    let data = {
        id_users: req.params.id
    }
    //ambil data yanng akan dihapus
    let sql = "select * from users where ?"
    db.query(sql, data, (error, result) => {
        if (error) throw error

        //tampung file lama
        let filename = result[0].foto

        //hapus file lama
        let dir = path.join(__dirname, "foto", filename)
        fs.unlink(dir, (error) => { })
    })

    sql = "delete from users where ?"
    db.query(sql, data, (error, result) => {
        if (error) throw error
        res.json({
            message: result.affectedRows + " berhasil dihapus"
        })
    })
})
app.get("/users", (req, res) => {
    let sql = "select * from users"
    db.query(sql, (error, result) => {
        if (error) throw error
        res.json({
            data: result,
            count: result.length
        })
    })
})

app.post("/transaksi", (req, res) => {
    let data = {
        kode_transaksi: req.body.kode_transaksi,
        id_users: req.body.id_users,
        tgl_transaksi: moment().format('YYYY-MM-DD HH-mm-ss')
    }
    let sql = "insert into transaksi set ?"
    db.query(sql, data, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        } else {
            let jml = req.body.jml
            let data1 = {
                kode_barang: req.body.kode_barang
            }
            // sql ambil harga barang
            let sql = "select harga from barang where ?"
            db.query(sql, data1, (error, result) => {
                if (error) {
                    res.json({
                        message: error.message
                    })
                } else {
                    let harga = result[0].harga
                    let hbeli = harga * jml
                    let data2 = {
                        kode_transaksi: req.body.kode_transaksi,
                        kode_barang: data1.kode_barang,
                        jumlah: jml,
                        harga_beli: hbeli
                    }
                    let sql = "insert into detail_transaksi set ?"
                    db.query(sql, data2, (error, result) => {
                        if (error) {
                            res.json({ message: error.message })
                        } else {
                            res.json({
                                message: result.affectedRows + " data berhasil ditambahkan"
                            })
                        }
                    })
                }

            })
        }
    })
})

app.put("/transaksi", (req, res) => {
    let data = [
        {
            id_users: req.body.id_users,
            tgl_transaksi: moment().format('YYYY-MM-DD')
        },
        {
            kode_transaksi: req.body.kode_transaksi
        }
    ]
    let sql = "update transaksi set ? where ?"
    db.query(sql, data, (error, result) => {
        if (error) throw error
        res.json({
            message: result.affectedRows + " data berhasil diupdate"
        })
    })
})

app.delete("/transaksi/:id", (req, res) => {
    let data = {
        kode_transaksi: req.params.id
    }
    let sql = "delete from detail_transaksi where ?"
    db.query(sql, data, (error, result) => {
        if (error) {
            res.json({ message : error.message})

        }else{
            let data = {
                kode_transaksi: req.params.id
            }
            
            let sql = "delete from transaksi where ?"
            db.query(sql, data, (error, result) => {
                if(error) throw error
                res.json({ message : result.affectedRows + " data berhasil dihapus"})
            })
        }

        
    })
})

app.get("/transaksi", (req, res) => {
    let sql = "select * from transaksi"
    db.query(sql, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        } else {
            res.json({
                data: result,
                count: result.length

            })
        }
    })
})

app.get("/detail", (req, res) => {
    let sql = "select * from detail_transaksi"
    db.query(sql, (error, result) => {
        if (error) {
            res.json({ message: error.message })
        } else {
            res.json({
                data: result,
                count: result.length

            })
        }
    })
})


app.listen(8000, () => {
    console.log("Server run on port 8000");
})