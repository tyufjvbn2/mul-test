import express from "express";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import formidable from "formidable";
import path from "path";
import fs from "fs";
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
	// const formOption = {
	// 	maxFileSize: 300 * 1024 * 1024,
	// };

	//파일 사이즈 제한은 가변적으로 조절 가능
	const form = new formidable.IncomingForm(/*formOption*/);

	await form.parse(req, (err, fields, files: any) => {
		//용량 큰 파일일때 에러남(file을 읽지 못함)
		if (!files.file) {
			res.status(404).json({ message: "wrong type file" });
		} else {
			console.log("file", files.file.name);
			const targetPath = path.join(
				__dirname,
				"../",
				"/uploaded",
				files.file.name
			);

			//중복 파일 체크해서 처리하는 로직
			const targetFile = fs.existsSync(targetPath);
			console.log("check", targetFile);

			if (targetFile) {
				console.log("same name file exist");
				res.status(409).json({
					message: "file name duplicated error",
				});
			} else {
				//파일 이름과 주소변경 처리
				fs.rename(files.file.path, targetPath, (err) => {
					//이름 주소 변경처리중 에러면 여기로
					if (err) {
						console.log("rename error", err);
						res.status(409).json({
							message: "rename error",
						});
					}
				});
				//파일 파싱하는 중에 에러면 여기로
				if (err) {
					console.log("error occured : ", err);
					// next(err)
					res.status(400).json({
						message: "error",
					});
				} else {
					//아무 문제 없으면 여기로
					res.status(200).json({
						message: "anyway done",
						fields,
						files,
					});
				}
			}
		}
	});
});

router.post("/mail", async (req, res) => {
	try {
		console.log("accept well");
		// const { title, content, email } = req.body;

		console.log("done");
		res.status(200).json({ message: "done" });
	} catch (err) {
		console.error("error", err);
		res.status(500).json({ message: err });
	}
});

app.listen(process.env.PORT, () => {
	console.log("smtp, sending video test server is on!!");
});
