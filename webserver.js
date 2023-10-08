const express = require('express');
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const multer = require('multer');

const db = pgp('postgres://postgres:1234@localhost:5432/accountant');

app.use(express.static(__dirname + "/"))
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + ".jpg");
    }
})
var upload = multer({ storage: storage}).single("myfile");

app.listen(3000, () => {
    console.log("server is running...")
})

app.get("/helloworld", (req, res) => {
    db.any("select * from ac_test")
    .then((data1) => {
        console.log(data1);
        return res.status(200).json(data1);
    })
    .catch((error1) => {
        console.log(error1);
        return res.status(400)
    })
})

app.post("/api/savestatement", (req, res) => {
    try {
        var type = req.body.type;
        var amount = req.body.amount;
        var img = req.body.img;

        if(type && amount && img) {
            var txn = "BL" + new Date().getTime();
            var doingtime = new Date() + "";
            var mil = new Date().getTime();
            amount = parseFloat(amount);
            db.any("insert into ac_transaction (txn, type, amount, img, doingtime, mil) values ($1,$4,$5,$6,$7,$8) returning * ",
            [txn, "", "", type, amount, img, doingtime, mil])
            .then((data1) => {
                return res.status(200).json({
                    code: 200,
                    message: "success"
                })
            })
            .catch(() => {
                return res.status(500).json({
                    code: 500,
                    message: "error"
                })
            })
        }
        else {
            return res.status(400).json({
                code: 400,
                message: "error"
            })
        }
    }
    catch(error) {
        return res.status(500).json({
            code: 500,
            message: "error"
        })
    }
})

app.post("/api/upload", (req, res) => {
    try {
        console.log("call me si")
        upload(req, res, (error) => {
            if(error) {
                return res.status(500).json({
                    code: 500,
                    message: "error"
                })
            }
            else {
                var filename = req.file.filename;
                console.log("filename", filename)
                return res.status(200).json({
                    code: 200,
                    message: "success",
                    result: {
                        purename: filename,
                        fullpath: "http://localhost:3000/uploads/" + filename
                    }
                })
            }
        })
    }
    catch(error) {
        return res.status(500).json({
            code: 500,
            message: "error"
        })
    }
})