import express from "express";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import formidable from "formidable";
import path from "path";
dotenv.config();

const app = express();
const router = express.Router();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

router.get("/", (req, res) => {
	res.send("test server!");
});

///잘못된 이메일 에러 테스트
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

//formidable 파일 전송 테스트
router.post("/file", async (req, res, next) => {
	console.log("body", req);

	const targetPath = path.join(__dirname, "../");

	const formOption = {
		// multiples: true,
		uploadDir: targetPath + "/uploaded",
		keepExtensions: true,
	};

	const form = new formidable.IncomingForm(formOption);

	await form.parse(req, (err, fields, files) => {
		if (err) {
			console.log("error occured : ", err);
			// next(err)
			res.status(400).json({
				message: "error",
			});
		}
		res.status(200).json({
			message: "anyway done",
			fields,
			files,
		});
	});

	// res.status(200).json({
	// 	message: "anyway done always",
	// });
});

app.listen(process.env.PORT, () => {
	console.log("smtp, sending video test server is on!!");
});
