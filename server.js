require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(cors());

const { Schema } = mongoose;
const urlSchema = new Schema({
	original_url: {
		type: String,
		required: true,
	},
});

const Url = mongoose.model("Url", urlSchema);

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:id", (req, res) => {
	const { id } = req.params;
	Url.findById(id, (err, url) => {
		if (err) return console.error(err);
		res.redirect(url.original_url);
	});
});

app.use("/api/shorturl", bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl", (req, res) => {
	const { url } = req.body;
	try {
		const newUrl = new URL(url);
		const first_url = new Url({
			original_url: newUrl.href,
		});
		if (newUrl.protocol === "http:" || newUrl.protocol === "https:") {
			first_url.save((err, data) => {
				if (err) return console.error(err);
				res.json({
					original_url: data.original_url,
					short_url: data._id,
				});
			});
		} else {
			res.json({ error: "invalid url" });
		}
	} catch (error) {
		res.json({ error: "invalid url" });
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
