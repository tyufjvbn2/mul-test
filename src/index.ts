import express from "express";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const app = express();
const router = express.Router();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

router.get("/", (req, res) => {
	res.send("test server!");
});

router.post("/test", async (req, res) => {
	console.log("accept well");
	const { title, content, email } = req.body;

	const transporter = nodemailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.MAILER_USER,
			pass: process.env.MAILER_PWD,
		},
	});

	const mailOption = {
		from: process.env.MAILER_USER,
		to: email,
		subject: title,
		// text: content,
		html: `여기서부터는 html <br> ${content}`,
	};

	await transporter.sendMail(mailOption, (err, done) => {
		if (err) {
			console.error("mailer send fail : ", err);
			res.status(400).json({
				message: "mail send fail",
			});
		} else {
			console.log("mail sent!", done.response);

			res.status(200).json({
				message: "mail send well!",
			});
		}
	});
});

app.listen(process.env.PORT, () => {
	console.log("smtp, sending video test server is on!!");
});
