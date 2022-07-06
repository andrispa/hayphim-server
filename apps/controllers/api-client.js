const router = require("express").Router(),
    helper = require("../modules/auth/helper"),
    jwtHelper = require("../helpers/jwt.helper"),
    dbMd = require("../modules/site/home"),
    request = require("request"),
    cors = require("cors"),
    Configstore = require("configstore");
router.use(
    cors({
        origin: process.env.CLIENT_URL.split(", "),
        optionsSuccessStatus: 200,
    })
);

router.get("/", function (req, res) {
    res.status(401).send("Đừng nghịch linh tinh nha! xin đấy :((");
});

// Đăng ký acc
router.post("/register", function (req, res) {
    const dbo = req.app.locals.db_2.db(process.env.DB_SV_2);
    const myobj = {};
    if (
        req.body.first_name.trim().length > 0 &&
        req.body.last_name.trim().length > 0 &&
        req.body.email.trim().length > 0 &&
        req.body.password.trim().length > 0 &&
        req.body.reCAPTCHA_token.trim().length > 0
    ) {
        request.post(
            {
                url: "https://www.google.com/recaptcha/api/siteverify",
                form: {
                    secret: "6LfLhOEUAAAAABUNx2WasSkkk1xxpYUKkIp-eatY",
                    response: req.body.reCAPTCHA_token,
                },
            },
            function (err, Res, body) {
                if (err) {
                    return res.json({
                        stt: "err",
                        message: "Không thể xác minh reCAPTCHA!",
                    });
                } else {
                    const ResponseAPI = JSON.parse(body);
                    if (ResponseAPI.success === true) {
                        myobj["first_name"] = req.body.first_name;
                        myobj["last_name"] = req.body.last_name;
                        myobj["name"] = `${req.body.first_name} ${req.body.last_name}`;
                        myobj["email"] = req.body.email;
                        myobj["password"] = helper.hashPassword(req.body.password);
                        myobj["level"] = 0;
                        myobj["type"] = "app";
                        req.body.gender ? (myobj["gender"] = req.body.gender) : null;
                        req.body.birthday ? (myobj["birthday"] = req.body.birthday) : null;
                        dbo
                            .collection(process.env.CL_USERS)
                            .createIndex({ email: 1 }, { unique: true });
                        dbo
                            .collection(process.env.CL_USERS)
                            .insertOne(myobj, async function (err, data) {
                                try {
                                    if (err) {
                                        return res.json({
                                            stt: "err",
                                            message: "Địa chỉ email đã được sử dụng!",
                                        });
                                    } else {
                                        const dataUser = data.ops[0];
                                        delete dataUser.password;
                                        const accessToken = await jwtHelper.generateToken(
                                            dataUser,
                                            process.env.SECURITY_JWT,
                                            process.env.SECURITY_JWT_LIFE
                                        );
                                        return res.json({ stt: "ok", token: accessToken });
                                    }
                                } catch (err) {
                                    return res.json({
                                        stt: "err",
                                        message: "Hệ thống lỗi, vui lòng thử lại sau ít phút!",
                                    });
                                }
                            });
                    } else {
                        return res.json({
                            stt: "err",
                            message: "Vui lòng xác minh reCAPTCHA!",
                        });
                    }
                }
            }
        );
    } else {
        return res.json({
            stt: "err",
            message: "Nhập đầy đủ các trường thông tin!",
        });
    }
});
// Đăng nhập bằng hệ thống
router.post("/login", function (req, res) {
    const dbo = req.app.locals.db_2.db(process.env.DB_SV_2);
    if (
        req.body.email.trim().length > 1 &&
        req.body.password.trim().length > 5 &&
        req.body.reCAPTCHA_token.trim().length > 0
    ) {
        request.post(
            {
                url: "https://www.google.com/recaptcha/api/siteverify",
                form: {
                    secret: "6LfLhOEUAAAAABUNx2WasSkkk1xxpYUKkIp-eatY",
                    response: req.body.reCAPTCHA_token,
                },
            },
            function (err, Res, body) {
                if (err) {
                    return res.json({
                        stt: "err",
                        message: "Không thể xác minh reCAPTCHA!",
                    });
                } else {
                    const ResponseAPI = JSON.parse(body);
                    if (ResponseAPI.success === true) {
                        dbo
                            .collection(process.env.CL_USERS)
                            .findOne({ email: req.body.email }, async function (err, data) {
                                if (data.ban)
                                    return res.json({
                                        stt: "err",
                                        message: "Tài khoản đã bị cấm!",
                                    });
                                try {
                                    if (helper.checkPassword(req.body.password, data.password)) {
                                        const dataUser = data;
                                        delete dataUser.password;
                                        dataUser.level === 9 ? delete dataUser.level : null;
                                        const accessToken = await jwtHelper.generateToken(
                                            dataUser,
                                            process.env.SECURITY_JWT,
                                            process.env.SECURITY_JWT_LIFE
                                        );
                                        return res.json({ stt: "ok", token: accessToken });
                                    } else {
                                        return res.json({
                                            stt: "err",
                                            message: "Mật khẩu không chính xác!",
                                        });
                                    }
                                } catch (error) {
                                    return res.json({
                                        stt: "err",
                                        message: "Email không tồn tại trên hệ thống!",
                                    });
                                }
                            });
                    } else {
                        return res.json({
                            stt: "err",
                            message: "Vui lòng xác minh reCAPTCHA!",
                        });
                    }
                }
            }
        );
    } else {
        return res.json({ stt: "err", message: "Nhập đầy đủ email và mật khẩu!" });
    }
});
// Đăng nhập bằng Facebook
router.post("/fb-login", async (req, res) => {
    const dbo = req.app.locals.db_2.db(process.env.DB_SV_2);
    if (req.body.code) {
        request.get(
            `https://graph.facebook.com/v6.0/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&redirect_uri=${process.env.CLIENT_URL.split(", ")[0]}/tai-khoan/dang-nhap&code=${req.body.code}`,
            function (err, Res, body) {
                if (err) {
                    return res.json({
                        stt: "err",
                        message: "Không thể xác minh người dùng!",
                    });
                } else {
                    const ResponseAPI = JSON.parse(body);
                    if (ResponseAPI.access_token) {
                        request.get(
                            `https://graph.facebook.com/v6.0/me?fields=id,name,birthday,gender,first_name,last_name,email&access_token=${ResponseAPI.access_token}`,
                            async function (err, Res, body) {
                                if (err) {
                                    return res.json({
                                        stt: "err",
                                        message: "Không thể xác minh người dùng!",
                                    });
                                } else {
                                    const dataUser = JSON.parse(body);
                                    dataUser[
                                        "avatar"
                                    ] = `https://graph.facebook.com/${dataUser.id}/picture?width=150&height=150`;
                                    dataUser["level"] = 0;
                                    dataUser["type"] = "fb";
                                    dataUser["email"] = Buffer.from(
                                        dataUser.email,
                                        "binary"
                                    ).toString("base64");
                                    dbo
                                        .collection(process.env.CL_USERS)
                                        .findOne({ id: dataUser.id }, async function (err, data) {
                                            if (data && data.ban)
                                                return res.json({
                                                    stt: "err",
                                                    message: "Tài khoản đã bị cấm!",
                                                });
                                            try {
                                                dataUser['_id'] = data._id;
                                                data["first_name"] = dataUser.first_name;
                                                data["last_name"] = dataUser.last_name;
                                                data["email"] = dataUser.email;
                                                data["birthday"] = dataUser.birthday;
                                                data["gender"] = dataUser.gender;
                                                data["id"] = dataUser.id;
                                                data["avatar"] = dataUser.avatar;
                                                dbo
                                                    .collection(process.env.CL_USERS)
                                                    .updateOne({ id: dataUser.id }, { $set: data });
                                                delete dataUser.id;
                                                data.level === 9 ? delete data.level : null;
                                                const accessToken = await jwtHelper.generateToken(
                                                    dataUser,
                                                    process.env.SECURITY_JWT,
                                                    process.env.SECURITY_JWT_LIFE
                                                );
                                                return res.json({ stt: "ok", token: accessToken });
                                            } catch (error) {
                                                const dataUserNew = dataUser;
                                                dataUserNew.level === 9
                                                    ? delete dataUserNew.level
                                                    : null;
                                                delete dataUserNew.id;
                                                await dbo
                                                    .collection(process.env.CL_USERS)
                                                    .insertOne(dataUserNew, async function (err, data) {
                                                        try {
                                                            if (err) {
                                                                return res.json({
                                                                    stt: "err",
                                                                    message: "Địa chỉ email đã được sử dụng!",
                                                                });
                                                            } else {
                                                                const idUser = data.ops[0]._id;
                                                                dataUserNew['_id'] = idUser;
                                                                const accessToken = await jwtHelper.generateToken(
                                                                    dataUserNew,
                                                                    process.env.SECURITY_JWT,
                                                                    process.env.SECURITY_JWT_LIFE
                                                                );
                                                                return res.json({ stt: "ok", token: accessToken });
                                                            }
                                                        } catch (err) {
                                                            return res.json({
                                                                stt: "err",
                                                                message: "Hệ thống lỗi, vui lòng thử lại sau ít phút!",
                                                            });
                                                        }
                                                    });
                                            }
                                        });
                                }
                            }
                        );
                    } else {
                        return res.json({ stt: "err", message: ResponseAPI.error.message });
                    }
                }
            }
        );
    } else {
        return res.json({ stt: "err", message: "Nhập đầy đủ email và mật khẩu!" });
    }
});

// Đăng nhập bằng google
router.post("/gl-login", async (req, res) => {
    const dbo = req.app.locals.db_2.db(process.env.DB_SV_2);
    if (req.body.code) {
        request.post(
            {
                url: "https://oauth2.googleapis.com/token",
                form: {
                    client_id:
                        "271579444853-th84k7b903v5icm9s3efk2tvkojpkre1.apps.googleusercontent.com",
                    client_secret: "HZvNtFAhnet1GOWL_i5Gyy8K",
                    redirect_uri:
                        process.env.CLIENT_URL.split(", ")[0] + "/tai-khoan/dang-nhap",
                    grant_type: "authorization_code",
                    code: req.body.code,
                },
            },
            function (err, Res, body) {
                if (err) {
                    return res.json({
                        stt: "err",
                        message: "Không thể xác minh người dùng!",
                    });
                } else {
                    const ResponseAPI = JSON.parse(body);
                    if (ResponseAPI.access_token) {
                        request.get(
                            {
                                url: "https://www.googleapis.com/oauth2/v2/userinfo",
                                headers: {
                                    Authorization: `Bearer ${ResponseAPI.access_token}`,
                                },
                            },
                            async function (err, Res, body) {
                                if (err) {
                                    return res.json({
                                        stt: "err",
                                        message: "Không thể xác minh người dùng!",
                                    });
                                } else {
                                    const dataUser = JSON.parse(body);
                                    dataUser["first_name"] = dataUser.given_name;
                                    dataUser["last_name"] = dataUser.family_name;
                                    dataUser["avatar"] = dataUser.picture;
                                    dataUser["level"] = 0;
                                    dataUser["type"] = "gl";
                                    dataUser["email"] = Buffer.from(
                                        "gl**" + dataUser.email,
                                        "binary"
                                    ).toString("base64");
                                    delete dataUser.picture;
                                    delete dataUser.given_name;
                                    delete dataUser.family_name;
                                    dbo
                                        .collection(process.env.CL_USERS)
                                        .findOne({ id: dataUser.id }, async function (err, data) {
                                            if (data && data.ban)
                                                return res.json({
                                                    stt: "err",
                                                    message: "Tài khoản đã bị cấm!",
                                                });
                                            try {
                                                dataUser['_id'] = data._id;
                                                data["first_name"] = dataUser.first_name;
                                                data["last_name"] = dataUser.last_name;
                                                data["email"] = dataUser.email;
                                                dataUser.birthday
                                                    ? (data["birthday"] = dataUser.birthday)
                                                    : null;
                                                dataUser.gender
                                                    ? (data["gender"] = dataUser.gender)
                                                    : null;
                                                data["id"] = dataUser.id;
                                                data["avatar"] = dataUser.avatar;
                                                delete dataUser.id;
                                                dbo
                                                    .collection(process.env.CL_USERS)
                                                    .updateOne({ id: dataUser.id }, { $set: data });
                                                delete dataUser.id;
                                                data.level === 9 ? delete data.level : null;

                                                const accessToken = await jwtHelper.generateToken(
                                                    dataUser,
                                                    process.env.SECURITY_JWT,
                                                    process.env.SECURITY_JWT_LIFE
                                                );
                                                return res.json({ stt: "ok", token: accessToken });
                                            } catch (error) {
                                                const dataUserNew = dataUser;
                                                dataUserNew.level === 9
                                                    ? delete dataUserNew.level
                                                    : null;
                                                delete dataUserNew.id;
                                                await dbo
                                                    .collection(process.env.CL_USERS)
                                                    .insertOne(dataUserNew, async function (err, data) {
                                                        try {
                                                            if (err) {
                                                                return res.json({
                                                                    stt: "err",
                                                                    message: "Địa chỉ email đã được sử dụng!",
                                                                });
                                                            } else {
                                                                const idUser = data.ops[0]._id;
                                                                dataUserNew['_id'] = idUser;
                                                                const accessToken = await jwtHelper.generateToken(
                                                                    dataUserNew,
                                                                    process.env.SECURITY_JWT,
                                                                    process.env.SECURITY_JWT_LIFE
                                                                );
                                                                return res.json({ stt: "ok", token: accessToken });
                                                            }
                                                        } catch (err) {
                                                            return res.json({
                                                                stt: "err",
                                                                message: "Hệ thống lỗi, vui lòng thử lại sau ít phút!",
                                                            });
                                                        }
                                                    });
                                            }
                                        });
                                }
                            }
                        );
                    } else {
                        return res.json({
                            stt: "err",
                            message: ResponseAPI.error_description,
                        });
                    }
                }
            }
        );
    } else {
        return res.json({ stt: "err", message: "Nhập đầy đủ email và mật khẩu!" });
    }
});

router.post("/user-info", async (req, res) => {
    const tokenFromClient = req.body.token || req.headers["meocoder-token"];
    if (tokenFromClient) {
        // Nếu tồn tại token
        try {
            // Thực hiện giải mã token xem có hợp lệ hay không?
            const decoded = await jwtHelper.verifyToken(
                tokenFromClient,
                process.env.SECURITY_JWT
            );
            // Nếu token hợp lệ, lưu thông tin giải mã được vào đối tượng req, dùng cho các xử lý ở phía sau.
            return res.json({ stt: "ok", "user-data": decoded });
            // Cho phép req đi tiếp sang controller.
        } catch (error) {
            // Nếu giải mã gặp lỗi: Không đúng, hết hạn...etc:
            // Lưu ý trong dự án thực tế hãy bỏ dòng debug bên dưới, mình để đây để debug lỗi cho các bạn xem thôi
            console.debug("Error while verify token:", error);
            return res.status(401).json({
                message: "Unauthorized.",
            });
        }
    } else {
        // Không tìm thấy token trong request
        return res.status(403).send({
            message: "No token provided.",
        });
    }
});
// Lấy danh sách phim
router.post("/get-list-movie", function (req, res) {
    if (req.body.id) {
        const appCache = req.app.locals.appCache;
        if (appCache.has(req.body.id)) {
            res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + 900000).toUTCString());
            return res.json({ status: "Done", data: appCache.get(req.body.id) });
        } else {
            dbMd
                .getFilmHome(
                    req.app.locals.db_1,
                    req.body.query,
                    req.body.option,
                    req.body.sort || "'other.p_at': -1",
                    Number(req.body.limit),
                    Number(req.body.skip)
                )
                .then((data) => {
                    appCache.set(req.body.id, data);
                    res.setHeader("Cache-Control", "public, max-age=2592000");
                    res.setHeader("Expires", new Date(Date.now() + 900000).toUTCString());
                    res.json({ status: "Done", data: data });
                })
                .catch((err) => res.json({ status: "error", mess: "null" }));
        }
    } else {
        dbMd
            .getFilmHome(
                req.app.locals.db_1,
                req.body.query,
                req.body.option,
                req.body.sort || "'other.p_at': -1",
                Number(req.body.limit),
                Number(req.body.skip)
            )
            .then((data) => {
                res.setHeader("Cache-Control", "public, max-age=2592000");
                res.setHeader("Expires", new Date(Date.now() + 900000).toUTCString());
                res.json({ status: "Done", data: data });
            })
            .catch((err) => res.json({ status: "error", mess: "null" }));
    }
});

// Lấy thông tin chi tiết của phim
router.post("/info-movie", function (req, res) {
    dbMd
        .getInfoOne(
            req.app.locals.db_1,
            'url: "' + req.body.url + '"',
            "url: 1, 'img.poster': 1, name: 1, c_c: 1, dir: 1, 'status.s': 1, 'status.r': 1, 'status.l': 1, 'content': 1, 'other.view': 1, 'other.d': 1, 'other.t_film': 1, 'other.year': 1, 'other.love': 1, 't_l.t_f' : 1, 't_l.t_r' : 1"
        )
        .then((data) => {
            res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + 43200000).toUTCString());
            res.json(data.value);
        });
});
// tìm kiếm phim
router.post("/search", function (req, res) {
    if (req.body.q) {
        dbMd
            .getFilmHome(
                req.app.locals.db_1,
                req.body.q,
                req.body.o,
                req.body.so || "'other.p_at': -1",
                Number(req.body.l),
                Number(req.body.s)
            )
            .then((data) => {
                res.json({ data: data });
            })
            .catch(() => res.json({ data: false }));
    } else {
        res.json({ data: null });
    }
});
// tìm kiếm diễn viên
router.post("/search-cast", function (req, res) {
    dbMd
        .searchCast(req.app.locals.db_4, req.body.q, Number(req.body.l))
        .then((data) => {
            res.json({ data: data });
        })
        .catch(() => res.json({ data: false }));
});
// Tăng số lượt yêu thích của phim
router.post("/love-movie", function (req, res) {
    dbMd
        .addLoveMovie(req.app.locals.db_1, req.body.id)
        .then(() => res.json({ status: true }))
        .catch(() => res.json({ status: false }));
});

// Báo lỗi phim
router.post("/report-movie", function (req, res) {
    dbMd
        .addReportMovie(req.app.locals.db_2, req.body)
        .then(() => res.json({ status: true }))
        .catch(() => res.json({ status: false }));
});

// Lấy danh sách tập của phim
router.post("/totalEp", function (req, res) {
    function getListServer(data) {
        const listServser = [];
        for (const iterator of data) {
            const numberServer = [];
            iterator.p
                ? numberServer.push(iterator.p.split("**").length)
                : numberServer.push(0);
            iterator.d
                ? numberServer.push(iterator.d.split("**").length)
                : numberServer.push(0);
            iterator.e
                ? numberServer.push(iterator.e.split("**").length)
                : numberServer.push(0);
            iterator.wtor
                ? numberServer.push(iterator.tor.split("**").length)
                : numberServer.push(0);
            iterator.tor
                ? numberServer.push(iterator.tor.split("**").length)
                : numberServer.push(0);
            iterator.tor
                ? numberServer.push(iterator.tor.split("**").length)
                : numberServer.push(0);
            listServser.push(numberServer);
        }
        return listServser;
    }
    if (req.body.id) {
        const epCache = new Configstore(req.body.id);
        if (
            epCache.has("data") &&
            epCache.get("data")["status"] === "ok" &&
            process.env.CACHE_TIME_LISTEP >
            new Date() - new Date(epCache.get("data").timeCreate)
        ) {
            console.log("dùng cache EP");
            const { status, listEP, listSV } = epCache.get("data");
            res.json({ status: status, server: listSV, total: listEP });
        } else {
            console.log("không dùng cache ep");
            dbMd
                .getListEp(req.app.locals.db_3, req.body.id, '"l": 1, _id: 0')
                .then((data) => {
                    data.l.sort((a, b) => {
                        return a.t - b.t;
                    });
                    const listEP = [];
                    const listSV = getListServer(data.l);
                    for (const key in data.l) {
                        listEP.push(data.l[key].t);
                    }
                    epCache.set("data", {
                        status: "ok",
                        episode: data.l,
                        listEP: listEP,
                        listSV: listSV,
                        timeCreate: new Date(),
                    });
                    res.json({ status: "ok", server: listSV, total: listEP });
                })
                .catch(() => {
                    epCache.set("data", {
                        status: "erorr",
                        episode: null,
                        listEP: "Không tìm thấy cái gì hết luôn á -_-",
                        listSV: null,
                        timeCreate: new Date(),
                    });
                    res.json({
                        status: "error",
                        total: "Không tìm thấy cái gì hết luôn á -_-",
                    });
                });
        }
    } else {
        res.json({
            status: "error",
            total: "ơ ID đâu, không có ID thì tôi tìm bằng gì? -_-",
        });
    }
});

// Lấy link play
router.post("/playback", function (req, res) {
    if (req.body.value && req.body.orign) {
        const playCache = new Configstore(req.body.id),
            errorMess = {
                status: "error",
                mess: "Tập phim không tồn tại trong máy chủ",
            };
        let a = "";
        if (
            playCache.has("data") &&
            process.env.CACHE_TIME_PLAYBACK >
            new Date() - new Date(playCache.get("data").timeCreate)
        ) {
            const { episode } = playCache.get("data");
            if (episode && req.body.value < episode.length) {
                console.log("dùng cache playback");
                switch (req.body.orign) {
                    case "1":
                        a = episode[req.body.value].p.split("**");
                        if (req.body.meo < a.length) {
                            return res.json({
                                status: "ok",
                                type: "orign",
                                drirect: a[req.body.meo],
                            });
                        } else {
                            return res.json(errorMess);
                        }
                    case "2":
                        a = episode[req.body.value].d.split("**");
                        if (req.body.meo < a.length) {
                            return res.json({
                                status: "ok",
                                type: "drive",
                                drirect: a[req.body.meo],
                            });
                        } else {
                            return res.json(errorMess);
                        }
                    case "3":
                        a = episode[req.body.value].e.split("**");
                        if (req.body.meo < a.length) {
                            return res.json({ status: "ok", type: "embed", ep: a[req.body.meo] });
                        } else {
                            return res.json(errorMess);
                        }
                    case "4":
                        a = episode[req.body.value].wtor.split("**");
                        if (req.body.meo < a.length) {
                            return res.json({ status: "ok", type: "webtor", ep: a[req.body.meo] });
                        } else {
                            return res.json(errorMess);
                        }
                    case "5":
                        a = episode[req.body.value].tor.split("**");
                        if (req.body.meo < a.length) {
                            return res.json({ status: "ok", type: "torvip", ep: a[req.body.meo] });
                        } else {
                            return res.json(errorMess);
                        }
                    case "6":
                        a = episode[req.body.value].tor.split("**");
                        if (req.body.meo < a.length) {
                            return res.json({ status: "ok", type: "torrent", ep: a[req.body.meo] });
                        } else {
                            return res.json(errorMess);
                        }
                    case "auto":
                        if (episode[req.body.value].p) {
                            return res.json({
                                status: "ok",
                                type: "orign",
                                drirect: episode[req.body.value].p.split("**")[0],
                            });
                        } else if (episode[req.body.value].d) {
                            return res.json({
                                status: "ok",
                                type: "drive",
                                drirect: episode[req.body.value].d.split("**")[0],
                            });
                        } else if (episode[req.body.value].e) {
                            return res.json({
                                status: "ok",
                                type: "embed",
                                ep: episode[req.body.value].e.split("**")[0],
                            });
                        } else if (episode[req.body.value].wtor) {
                            return res.json({
                                status: "ok",
                                type: "webtor",
                                ep: episode[req.body.value].wtor.split("**")[0],
                            });
                        } else if (episode[req.body.value].tor) {
                            return res.json({
                                status: "ok",
                                type: "torvip",
                                ep: episode[req.body.value].tor.split("**")[0],
                            });
                        }
                        // else if (episode[req.body.value].tor) {
                        //     return res.json({
                        //         status: "ok",
                        //         type: "torvip",
                        //         ep: episode[req.body.value].tor.split("**")[0],
                        //     });
                        // }
                        break;
                    default:
                        return res.json(errorMess);
                }
            } else {
                return res.json(errorMess);
            }
        } else {
            console.log("không dùng cache playback");
            dbMd
                .getListEp(req.app.locals.db_3, req.body.id, "")
                .then((data) => {
                    data.l.sort((a, b) => {
                        return a.t - b.t;
                    });
                    // playCache.set('data_play', { episode: data.l, timeCreate: new Date() });
                    if (req.body.value < data.l.length) {
                        switch (req.body.orign) {
                            case "1":
                                a = data.l[req.body.value].p.split("**");
                                if (req.body.meo < a.length) {
                                    return res.json({
                                        status: "ok",
                                        type: "orign",
                                        drirect: a[req.body.meo],
                                    });
                                } else {
                                    return res.json(errorMess);
                                }
                            case "2":
                                a = data.l[req.body.value].d.split("**");
                                if (req.body.meo < a.length) {
                                    return res.json({
                                        status: "ok",
                                        type: "drive",
                                        drirect: a[req.body.meo],
                                    });
                                } else {
                                    return res.json(errorMess);
                                }
                            case "3":
                                a = data.l[req.body.value].e.split("**");
                                if (req.body.meo < a.length) {
                                    return res.json({
                                        status: "ok",
                                        type: "embed",
                                        ep: a[req.body.meo],
                                    });
                                } else {
                                    return res.json(errorMess);
                                }
                            case "4":
                                a = data.l[req.body.value].wtor.split("**");
                                if (req.body.meo < a.length) {
                                    return res.json({
                                        status: "ok",
                                        type: "webtor",
                                        ep: a[req.body.meo],
                                    });
                                } else {
                                    return res.json(errorMess);
                                }
                            case "5":
                                a = data.l[req.body.value].tor.split("**");
                                if (req.body.meo < a.length) {
                                    return res.json({
                                        status: "ok",
                                        type: "torvip",
                                        ep: a[req.body.meo],
                                    });
                                } else {
                                    return res.json(errorMess);
                                }
                            case "6":
                                a = data.l[req.body.value].tor.split("**");
                                if (req.body.meo < a.length) {
                                    return res.json({
                                        status: "ok",
                                        type: "torrent",
                                        ep: a[req.body.meo],
                                    });
                                } else {
                                    return res.json(errorMess);
                                }
                            case "auto":
                                if (data.l[req.body.value].p) {
                                    return res.json({
                                        status: "ok",
                                        type: "orign",
                                        drirect: data.l[req.body.value].P.split("**")[0],
                                    });
                                } else if (data.l[req.body.value].d) {
                                    return res.json({
                                        status: "ok",
                                        type: "drive",
                                        drirect: data.l[req.body.value].d.split("**")[0],
                                    });
                                } else if (data.l[req.body.value].e) {
                                    return res.json({
                                        status: "ok",
                                        type: "embed",
                                        ep: data.l[req.body.value].e.split("**")[0],
                                    });
                                } else if (data.l[req.body.value].wtor) {
                                    return res.json({
                                        status: "ok",
                                        type: "webtor",
                                        ep: data.l[req.body.value].wtor.split("**")[0],
                                    });
                                } else if (data.l[req.body.value].tor) {
                                    return res.json({
                                        status: "ok",
                                        type: "torvip",
                                        ep: data.l[req.body.value].tor.split("**")[0],
                                    });
                                }
                                // else if (data.l[req.body.value].tor) {
                                //     return res.json({
                                //         status: "ok",
                                //         type: "torvip",
                                //         ep: data.l[req.body.value].tor.split("**")[0],
                                //     });
                                // }
                                break;
                            default:
                                return res.json(errorMess);
                        }
                    } else {
                        return res.json(errorMess);
                    }
                })
                .catch(() => {
                    return res.json({ status: "error", mess: "Không có dữ liệu" });
                });
        }
    }
});

// Lấy danh sách diễn viên của phim
router.post("/cast", function (req, res) {
    dbMd
        .getListCastMovie(req.app.locals.db_4, req.body.id)
        .then((data) => {
            res.json({ data: data });
        })
        .catch((err) => res.json({ data: null }));
});

// Lấy danh sách phim có diễn viên tham gia
router.post("/cast-movie", function (req, res) {
    dbMd
        .getListMovieInCast(
            req.app.locals.db_1,
            req.app.locals.db_4,
            req.body.name,
            req.body.sort || "'other.p_at': -1",
            Number(req.body.limit),
            Number(req.body.skip)
        )
        .then((data) => {
            res.json(data);
        })
        .catch((err) => res.json([]));
});
// Thêm bình luận
router.post("/add-comment", function (req, res) {
    jwtHelper
        .verifyToken(
            req.headers["authorization"].split("Bearer ")[1],
            process.env.SECURITY_JWT
        )
        .then((dataUser) => {
            dataUser = dataUser.data;
            dbMd
                .addComment(req.app.locals.db_5, req.body, dataUser._id || dataUser.id)
                .then((data) => {
                    const dataComment = data.ops[0];
                    dataComment["u_name"] = dataUser.name;
                    dataUser.avatar ? (dataComment["u_img"] = dataUser.avatar) : null;
                    if (req.body.mode === "comment") {
                        dataComment["nLike"] = 0;
                        dataComment["nComment"] = 0;
                        dataComment["isLike"] = false;
                        dataComment["reply"] = true;
                        return res.json({ status: true, data: dataComment });
                    }
                    res.json({ status: true, data: dataComment });
                })
                .catch((err) => {
          /*console.log(err);*/ res.json({ status: false });
                });
        })
        .catch((err) => res.json({ status: false }));
});
// Lấy danh sách bình luận
router.post("/comment", function (req, res) {
    dbMd
        .getListComment(
            req.app.locals.db_5,
            req.body.id,
            req.body.sort || "isPin: -1, time: -1",
            Number(req.body.limit),
            Number(req.body.skip),
            req.body.mode
        )
        .then((data) => {
            let dataComment = data[0];
            const arrayUserID = [...new Set(dataComment.map((e) => e.id_u))];
            dbMd
                .getListInfoUser(req.app.locals.db_2, arrayUserID)
                .then((infoUse) => {
                    const objInfoUser = {
                        3101999: {
                            u_name: "ADMIN HAYPHIM",
                            u_img: "https://i.imgur.com/9l2hhvh.png",
                        },
                    };
                    for (const user of infoUse) {
                        user.id
                            ? !objInfoUser[user.id]
                                ? (objInfoUser[user.id] = {})
                                : null
                            : !objInfoUser[user._id]
                                ? (objInfoUser[user._id] = {})
                                : null;
                        user.id
                            ? (objInfoUser[user.id]["u_name"] = user.name)
                            : (objInfoUser[user._id]["u_name"] = user.name);
                        user.id
                            ? user.avatar
                                ? (objInfoUser[user.id]["u_img"] = user.avatar)
                                : null
                            : user.avatar
                                ? (objInfoUser[user._id]["u_img"] = user.avatar)
                                : null;
                        user.type === "fb"
                            ? (objInfoUser[user.id][
                                "u_img"
                            ] = `https://graph.facebook.com/${user.id}/picture?width=110&height=110`)
                            : null;
                    }
                    for (const comment of dataComment) {
                        comment["u_name"] = objInfoUser[comment["id_u"]].u_name;
                        objInfoUser[comment["id_u"]].u_img
                            ? (comment["u_img"] = objInfoUser[comment["id_u"]].u_img)
                            : null;
                    }
                    // console.log(objInfoUser)
                    if (req.body.mode === "comment") {
                        if (req.body.idUser) {
                            dataComment.forEach((element, index) => {
                                dataComment[index]["reply"] = true;
                                if (element.like) {
                                    dataComment[index]["nLike"] = element.like.length;
                                    element.like.indexOf(req.body.idUser) !== -1
                                        ? (dataComment[index]["isLike"] = true)
                                        : (dataComment[index]["isLike"] = false);
                                    delete dataComment[index]["like"];
                                } else {
                                    dataComment[index]["nLike"] = 0;
                                    dataComment[index]["isLike"] = false;
                                    delete dataComment[index]["like"];
                                }
                            });
                        } else {
                            dataComment.forEach((element, index) => {
                                dataComment[index]["reply"] = true;
                                element.like
                                    ? (dataComment[index]["nLike"] = element.like.length)
                                    : (dataComment[index]["nLike"] = 0);
                            });
                        }
                        return res.json({
                            status: true,
                            data: dataComment,
                            total: data[1],
                        });
                    }
                    return res.json({ status: true, data: data[0], total: data[1] });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ status: false });
                });
        })
        .catch((err) => {
      /*console.log(err);*/ res.json({ status: false });
        });
});

// Tương tác bình luận
router.post("/reaction-comment", function (req, res) {
    dbMd
        .reactionComment(
            req.app.locals.db_5,
            req.body.id,
            req.body.mode,
            req.headers["authorization"]
        )
        .then((data) => {
            res.json({ status: true });
        })
        .catch((err) => res.json({ status: false }));
});
// Lấy danh sách thông tin tùy chỉnh web
router.post("/get-setting-info", function (req, res) {
    dbMd
        .getCustom(req.app.locals.db_4, req.body.locale)
        .then((data) => {
            const country = {};
            const countryName = {};
            const category = {};
            const categoryName = {};
            data.country.map((a) => {
                country[a.seo] = a.value;
                countryName[a.value] = a.name;
            });
            data.category.map((a) => {
                category[a.seo] = a.value;
                categoryName[a.value] = a.name;
            });
            data["country"] = country;
            data["countryName"] = countryName;
            data["category"] = category;
            data["categoryName"] = categoryName;
            res.json({ status: true, data: data });
        })
        .catch((err) => res.json({ status: false }));
});

// cập nhật ảnh đại diện người dùng
router.post("/update-account", function (req, res) {
    jwtHelper
        .verifyToken(
            req.headers["authorization"].split("Bearer ")[1],
            process.env.SECURITY_JWT
        )
        .then((dataUser) => {
            dbMd
                .accountUpdate(req.app.locals.db_2, req.body.type, req.body, dataUser.data._id)
                .then(async () => {
                    switch (req.body.type) {
                        case 'avatar':
                            try {
                                dataUser.data['avatar'] = req.body.avatar;
                                const accessToken = await jwtHelper.generateToken(
                                    dataUser.data,
                                    process.env.SECURITY_JWT,
                                    Math.ceil(((Number(dataUser.exp) * 1000) - Date.now()) / 1000 / 60 / 60 / 24) + 'd'
                                );
                                return res.json({ stt: 'ok', token: accessToken });
                            } catch (err) {
                                // console.log(err)
                                return res.json({ stt: false });
                            }
                        case 'change-password':
                            return res.json({ stt: true });
                        default:
                            return res.json({ stt: false });
                    }
                })
                .catch((err) => {
                    // console.log(err);
                    res.json({ stt: false, code: err.code || null });
                });
        })
        .catch((err) => {
            // console.log(err);
            res.json({ stt: false });
        });
    // dbMd
    //   .accountUpdate(req.app.locals.db_4, req.body.type, req.body.data)
    //   .then((data) => {
    //     const country = {};
    //     const countryName = {};
    //     const category = {};
    //     const categoryName = {};
    //     data.country.map((a) => {
    //       country[a.seo] = a.value;
    //       countryName[a.value] = a.name;
    //     });
    //     data.category.map((a) => {
    //       category[a.seo] = a.value;
    //       categoryName[a.value] = a.name;
    //     });
    //     data["country"] = country;
    //     data["countryName"] = countryName;
    //     data["category"] = category;
    //     data["categoryName"] = categoryName;
    //     res.json({ status: true, data: data });
    //   })
    //   .catch((err) => res.json({ status: false }));
});

module.exports = router;
