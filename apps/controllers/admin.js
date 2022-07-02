let express = require('express'),
router = express.Router(),
toolFilmMd = require('../modules/admin/toolFilm'),
listGetInfo = require('../modules/admin/listFilm'),
customMd = require('../modules/admin/other'),
gitToolMd = require('../modules/admin/gitTool'),
jsonContruy = require('../json/contruy'),
jsonCategory = require('../json/category'),
jsonConfig = require('../../config/default'),
fs = require('fs'),
jwtHelper = require("../helpers/jwt.helper"),
v2t = {};
router.use(async function(req, res, next) {
  if(req.url !== '/auth/check' && req.url !== '/auth/login' && req.method === 'POST') {
    if(!req.headers.authorization) return res.status(404).json({ status: false });
    try {
      // console.log(req.url, req.method, req.url !== '/auth/check' && req.url !== '/auth/login' && req.method === 'POST')
      // console.log(JSON.stringify(req.headers.authorization));
      await jwtHelper.verifyToken(req.headers.authorization.split('Bearer ')[1], process.env.SECURITY_JWT);
      return next();
    } catch (error) {
      return res.status(404).json({ status: false });
    }
  } else {
    return next();
  }
});
const cors = require('cors');
router.use(cors({
    origin: process.env.ADMIN_URL.split(', '),
    optionsSuccessStatus: 200
}));
router.get("/", function(req, res){
	if(req.session.user && req.session.user.level == 9){
		let admin_link = "admin";
	res.render("admin/", {link: admin_link, page : "", user: req.session.user, layoutHome: jsonConfig.home} );
	}else{
		res.redirect('/auth/login');
	}
});
// router.get("/:page", function(req, res){
// 	let admin_link = "admin";
// 	res.render(admin_link + "/"+ req.params.page, {link: admin_link, page : req.params.page});
// });
router.get("/manage", function(req, res){
	let db = req.app.locals.db_1, db_3 = req.app.locals.db_3;
	if(req.session.user && req.session.user.level == 9){
		let admin_link = "admin";
		switch(req.query.type)
		{
		case 'movie':
			if (req.query.action == 'list') {
				let limit = 15; skip = 0, pageactive = Math.abs(req.query.page) || 1;
				skip = (pageactive - 1)*limit;
				//data[0] trả về tổng số phim // data[1] trả về thông tin phim
				listGetInfo.getList(db, '',"url: 1, 'img.poster': 1, name: 1, 'status.s': 1, 't_l.t_f': 1, 'other.view': 1, 'other.year': 1, 't_l.t_r': 1", limit, skip)
				.then(data => res.render(admin_link + '/film/'+req.query.action, {link: admin_link, page : req.params.action, data: data[1], page: [Math.abs(pageactive), Math.ceil(data[0]/limit)], user: req.session.user}));
			}
			else if (req.query.action == 'add'){
				res.render(admin_link + '/film/'+req.query.action, {link: admin_link, page : req.params.action, contruy: jsonContruy, category: jsonCategory, status: 'new', user: req.session.user});
			}
			else if (req.query.action == 'edit') {
				toolFilmMd.getInfoFilm(db, req.query.id)
				.then((data) =>{
					res.render(admin_link + '/film/'+req.query.action, {link: admin_link, page : 'edit', contruy: jsonContruy, category: jsonCategory, data: data, status: req.query.status, user: req.session.user});
				})
				.catch(err => res.redirect('/'+admin_link+'/manage?type=movie&action=add'));
			}else{
				res.redirect('/'+admin_link+'/manage?type=movie&action=add');
			}
			break;
		case 'episode':
			if (req.query.action == 'list') {
				toolFilmMd.getListEp(req.app.locals.db_3, req.query.id, '')
				.then(data => res.render(admin_link + '/film/listEpisode', {link: admin_link, data: data, type: req.query.action, data2: req.query.id, user: req.session.user}));
			}else if (req.query.action == 'addMultiple') {
				res.render(admin_link + '/film/addEpisode', {link: admin_link, data: req.query, user: req.session.user});
			}else if (req.query.action == 'addOne') {
				res.render(admin_link + '/film/addEpisode', {link: admin_link, data: req.query, user: req.session.user});
			}else if (req.query.action == 'edit') {
					res.render(admin_link + '/film/addEpisode', {link: admin_link, data: req.query, user: req.session.user});
			}else if (req.query.action == 'del') {
				toolFilmMd.delEpOne(db_3, req.query)
				.then(data => res.json({status: 'ok'}))
				.catch(err => res.json({status: 'err'}));
			}
			else if (req.query.action == 'deleteallepisode') {
				toolFilmMd.delAllEpisode(db_3, req.query.id)
				.then(data => res.json({status: 'ok'}))
				.catch(err => res.json({status: 'err'}));
			}
			break;
		case 'category':
			if (req.query.action == 'list') {
				res.render(admin_link + '/category/'+req.query.action, {link: admin_link, data: jsonCategory, type: req.query.action, user: req.session.user});
			}
			else if (req.query.action == 'add') {
				res.render(admin_link + '/category/'+req.query.action, {link: admin_link, type: req.query.action, user: req.session.user});
			}
			else if (req.query.action == 'edit') {
				res.render(admin_link + '/category/add', {link: admin_link, data: jsonCategory, type: req.query.action, stt: req.query.stt, user: req.session.user});
			}
			else if (req.query.action == 'del') {
				jsonCategory.splice(req.query.stt,1);
				jsonCategory.forEach((i) => {
					v2t[i.value] = i.name;
				})
				fs.writeFile('apps/json/category_v2t.json', JSON.stringify(v2t), () => {});
				fs.writeFile('apps/json/category.json', JSON.stringify(jsonCategory), function (err) {
					if (err) throw err;
					res.redirect('/'+admin_link + '/manage?type=category&action=list');
				}); 
			}
			break;
		case 'country':
			if (req.query.action == 'list') {
				res.render(admin_link + '/country/'+req.query.action, {link: admin_link, data: jsonContruy, type: req.query.action, user: req.session.user});
			}
			else if (req.query.action == 'add') {
				res.render(admin_link + '/country/'+req.query.action, {link: admin_link, type: req.query.action, user: req.session.user});
			}
			else if (req.query.action == 'edit') {
				res.render(admin_link + '/country/add', {link: admin_link, data: jsonContruy, type: req.query.action, stt: req.query.stt, user: req.session.user});
			}
			else if (req.query.action == 'del') {
				jsonContruy.splice(req.query.stt,1);
				jsonContruy.forEach((i) => {
					v2t[i.value] = i.name;
				})
				fs.writeFile('apps/json/contruy_v2t.json', JSON.stringify(v2t), () => {});
				fs.writeFile('apps/json/contruy.json', JSON.stringify(jsonContruy), function (err) {
					if (err) throw err;
					res.redirect('/'+admin_link + '/manage?type=country&action=list');
				});
			}
			break;
		case 'config':
			if (req.query.action == 'custom') {
				res.render(admin_link + '/config/'+req.query.action, {link: admin_link, data: jsonConfig.custom, user: req.session.user});
			}
			else if (req.query.action == 'database') {
				res.render(admin_link + '/config/'+req.query.action, {link: admin_link, data: jsonConfig.database, user: req.session.user});
			}
			else if (req.query.action == 'security') {
				res.render(admin_link + '/config/'+req.query.action, {link: admin_link, data: jsonConfig.security, user: req.session.user});
			}
			else if (req.query.action == 'advanced') {
				res.render(admin_link + '/config/'+req.query.action, {link: admin_link, data: jsonConfig.advanced, user: req.session.user});
			}
			else if (req.query.action == 'number-movie') {
				res.render(admin_link + '/config/'+req.query.action, {link: admin_link, data: jsonConfig.number_movie, user: req.session.user});
			}
			else if (req.query.action == 'home') {
				res.render(admin_link + '/config/'+req.query.action, {link: admin_link, data: jsonConfig.home, user: req.session.user});
			}
			break;
		default:
			res.render(admin_link + '/film/'+req.params.action.split('-')[0], {link: admin_link, page : 'add', contruy: jsonContruy, category: jsonCategory, status: 'new', user: req.session.user});	
			break;
		}
	}else{
		res.redirect('/auth/login')
	}
});

// MOVIE CURD
router.post("/manage/get-list-movie", function(req, res){
	listGetInfo.getListMovie(req.app.locals.db_1, req.body.q,"url: 1, 'img.poster': 1, name: 1, 'status.s': 1, 't_l': 1, 'other.view': 1, 'other.year': 1", Number(req.body.limit), Number(req.body.skip))
	.then(data => res.json(data))
	.catch( err => res.json({}));
});
router.post("/manage/get-info-movie", function(req, res){
	toolFilmMd.getInfoFilm(req.app.locals.db_1, req.app.locals.db_4, req.body.id)
	.then( data => res.json({ data_info: data[0], data_cast: data[1].map(({ name }) => name) }))
	.catch( err => res.json({}));
});
router.post("/manage/edit-movie", function(req, res){
	toolFilmMd.editFilm(req.app.locals.db_1, req.app.locals.db_4, JSON.parse(req.body.params))
	.then(data => res.json({ status: true }))
	.catch(err => res.json({ status: false }));
});
router.post("/manage/add-movie", function(req, res){
	toolFilmMd.addFilm(req.app.locals.db_1, JSON.parse(req.body.params))
	.then(async (data) => {
		const paramsData = JSON.parse(req.body.params);
		await toolFilmMd.addMovie2Cast(req.app.locals.db_4, data.ops[0]._id, paramsData.cast);
		gitToolMd.uploadImg2Gitlab(paramsData.img.poster, paramsData.url);
		res.json({ status: true, data: { name: data.ops[0].name.vn, id: data.ops[0]._id } })
	})
	.catch((err) => {
		res.json({ status: false })
	});
});
router.post("/manage/delete-movie", function(req, res){
	toolFilmMd.delMovies(req.app.locals.db_1, req.body.arrayID)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: 'Xóa phim thất bại' }));
});
router.post("/manage/advance-movie", function(req, res){
	toolFilmMd.advanceMovie(req.app.locals.db_1, req.body.type, req.body.arrayID)
	.then(() => res.json({}))
	.catch( err => res.json({ err: 'Chỉnh sửa nâng cao thất bại' }));
});

// CAST CURD
router.post("/manage/get-list-cast", function(req, res){
	customMd.getListCast(req.app.locals.db_4, req.body.limit, req.body.skip)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => err.code === 0 ? res.json({ err: 'Try vấn không hợp lệ' }) : res.json({ err: 'Không thể lấy danh sách điễn viên' }));
});
router.post("/manage/get-info-cast", function(req, res){
	customMd.getInfoCast(req.app.locals.db_4, req.body.id)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: 'Không thể lấy thông tin điễn viên' }));
});
router.post("/manage/add-cast", function(req, res){
	customMd.addCast(req.app.locals.db_4, req.body)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => err.code === 11000 ? res.json({ err: 'diễn viên đã tồn tại' }) : res.json({ err: err }));
});
router.post("/manage/edit-cast", function(req, res){
	customMd.editCast(req.app.locals.db_4, req.body)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => err.code === 11000 ? res.json({ err: 'Thông tin chỉnh sửa trùng với thông tin khác trên cơ sở dữ liệu' }) : res.json({ err: err }));
});
router.post("/manage/delete-cast", function(req, res){
	customMd.deleteCast(req.app.locals.db_4, req.body.id)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: 'Xóa diễn viên thất bại' }));
});
router.post("/manage/delete-casts", function(req, res){
	customMd.deleteCasts(req.app.locals.db_4, req.body.arrayID)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: 'Xóa diễn viên thất bại' }));
});

// EPISODE CURD
router.post("/manage/get-list-episode", function(req, res){
	toolFilmMd.getListEp(req.app.locals.db_3, req.body.id, '')
	.then(data => res.json(data))
	.catch( err => res.json({ err: 'Lấy thông tin tập thất bại' }));
});
router.post("/manage/curd-episode", function(req, res){
	toolFilmMd.CURDEpisode(req.app.locals.db_3, req.body)
	.then(data => res.json(data))
	.catch( err => res.json({ err: 'Chỉnh sửa tập thất bại' }));
});
router.post("/manage/delete-all-episode", function(req, res){
	toolFilmMd.delAllEpisode(req.app.locals.db_3, req.body.id)
	.then(data => res.json(data))
	.catch( err => res.json({ err: 'Xóa sửa tập thất bại' }));
});

// CATEGORY CURD //
router.post("/manage/get-list-category", function(req, res){
	customMd.getListCategory(req.app.locals.db_4, req.body.locale)
	.then((data) =>{
		res.json(data.category || []);
	})
	.catch( err => res.json({ err: err }));
});
router.post("/manage/curd-category", function(req, res){
	customMd.CURDCategory(req.app.locals.db_4, req.body.category, req.body.locale)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: err }));
});

//  COUNTRY CURD
router.post("/manage/get-list-country", function(req, res){
	customMd.getListCountry(req.app.locals.db_4, req.body.locale)
	.then((data) =>{
		res.json(data.country || []);
	})
	.catch( err => res.json({ err: err }));
});
router.post("/manage/curd-country", function(req, res){
	customMd.CURDCountry(req.app.locals.db_4, req.body.country, req.body.locale)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: err }));
});

// CUSTOM CURD
router.post("/manage/get-list-custom", function(req, res){
	customMd.getCustom(req.app.locals.db_4, req.body.type, req.body.locale)
	.then(data => res.json(data[req.body.type] || {}))
	.catch( err => res.json({ err: 'Lấy thông tin custom basic thất bại' }));
});
router.post("/manage/curd-custom", function(req, res){
	customMd.CURDCustom(req.app.locals.db_4, req.body.type, JSON.parse(req.body.params), req.body.locale)
	.then(data => res.json({ status: true }))
	.catch( err => res.json({ status: false }));
});

// GET STATUS SERVER
router.post("/get-server-status", function(req, res){
	toolFilmMd.serverStatus(req.app.locals[req.body.db], parseInt(req.body.db_number))
	.then(data => res.json({'status': 'ok', data: data}))
    .catch (err => res.json({ 'status': 'error', 'mess': 'null' }));
});

// CACHE CONTROL
router.post("/manage/delete-cache", function(req, res){
	res.json({'deleted': (req.app.locals.appCache).del(req.body.id) });
});
router.post("/manage/getlist-cache", function(req, res){
	res.json((req.app.locals.appCache).keys());
});
// get total number movie 
router.post("/manage/get-number-movie", function(req, res){
	toolFilmMd.countMovie(req.app.locals.db_1)
	.then(data => res.json(data))
    .catch (err => res.json([]));
});

// CURD USER 
router.post("/manage/get-list-user", function(req, res){
	customMd.getListUser(req.app.locals.db_2, req.body.limit, req.body.skip)
	.then(data => res.json(data))
    .catch (err => res.json({ err: 1 }));
});
router.post("/manage/curd-user", function(req, res){
	customMd.CURDUser(req.app.locals.db_2, req.body.type, req.body.arrayID)
	.then(data => res.json({ status: true }))
    .catch (err => res.json({ status: false }));
});

// CURD REPORT
router.post("/manage/get-list-report", function(req, res){
	customMd.getListReport(req.app.locals.db_2, req.body.limit, req.body.skip)
	.then(data => res.json(data))
    .catch (err => res.json({ err: 1 }));
});
router.post("/manage/curd-report", function(req, res){
	customMd.CURDReport(req.app.locals.db_2, req.body.type, req.body.arrayID)
	.then(data => res.json({ status: true }))
    .catch (err => res.json({ status: false }));
});




router.post("/film/add", function(req, res){
	let admin_link = "admin";		
	let addFilm = toolFilmMd.addFilm(req.app.locals.db_1, req.body);
	addFilm.then((data) =>{
		res.render(admin_link + "/film/add", {link: admin_link,  page: "add", status: 'success', id: data.insertedId, name: req.body.ten_phim_vn, user: req.session.user});
	});
});
router.post("/film/edit", function(req, res){
	let admin_link = "admin";
	toolFilmMd.editFilm(req.app.locals.db_1, req.body)
	.then(data => res.redirect('/'+admin_link + '/manage?type=movie&action=edit&id='+req.body.id+'&status=done'))
	.catch(err => res.redirect('/'+admin_link + '/manage?type=movie&action=edit&id='+req.body.id+'&status=edit'));
});
router.post("/film/delete", function(req, res){
	let admin_link = "admin";
	toolFilmMd.delMovie(req.app.locals.db_1, req.body.id)
	.then(data => res.json({status: 'ok'}))
	.catch(err => res.json({status: 'err'}));
});
router.post("/film/deletes", function(req, res){
	let admin_link = "admin";
	toolFilmMd.delMovies(req.app.locals.db_1, req.body.arrayID)
	.then(data => res.json({status: 'ok'}))
	.catch(err => res.json({status: 'err'}));
});
router.post("/category/edit", function(req, res){
	let admin_link = "admin";
	jsonCategory[req.body.id].name = req.body.name;
	jsonCategory[req.body.id].seo = req.body.seo;
	jsonCategory[req.body.id].value = req.body.value;
	jsonCategory.forEach((i) => {
		v2t[i.value] = i.name;
	})
	fs.writeFile('apps/json/category_v2t.json', JSON.stringify(v2t), () => {});
	fs.writeFile('apps/json/category.json', JSON.stringify(jsonCategory), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=category&action=list');
	});
});
router.post("/category/add", function(req, res){
	let admin_link = "admin";
	jsonCategory.push({"name":req.body.name,"seo":req.body.seo,"value":req.body.value.toString()});
	jsonCategory.forEach((i) => {
		v2t[i.value] = i.name;
	})
	fs.writeFile('apps/json/category_v2t.json', JSON.stringify(v2t), () => {});
	fs.writeFile('apps/json/category.json', JSON.stringify(jsonCategory), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=category&action=list');
	});
});
router.post("/country/edit", function(req, res){
	let admin_link = "admin";
	jsonContruy[req.body.id].name = req.body.name;
	jsonContruy[req.body.id].seo = req.body.seo;
	jsonContruy[req.body.id].value = req.body.value;
	jsonContruy.forEach((i) => {
		v2t[i.value] = i.name;
	})
	fs.writeFile('apps/json/contruy_v2t.json', JSON.stringify(v2t), () => {});
	fs.writeFile('apps/json/contruy.json', JSON.stringify(jsonContruy), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=country&action=list');
	});
});
router.post("/country/add", function(req, res){
	let admin_link = "admin";
	jsonContruy.push({"name":req.body.name,"seo":req.body.seo,"value":req.body.value.toString()});
	jsonContruy.forEach((i) => {
		v2t[i.value] = i.name;
	})
	fs.writeFile('apps/json/contruy_v2t.json', JSON.stringify(v2t), () => {});
	fs.writeFile('apps/json/contruy.json', JSON.stringify(jsonContruy), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=country&action=list');
	});
});
router.post("/film/addEpisode", function(req, res){
	let admin_link = "admin";
	if (req.body.mode == 'one') {
		let addEpisode = toolFilmMd.addEpisodeOne(req.app.locals.db_3, req.body);
		addEpisode.then(data => res.redirect('/'+admin_link + '/manage?type=episode&action=list&id='+req.body.id));
	}else if (req.body.mode == 'multiple') {
		let addEpisode = toolFilmMd.addEpisode(req.app.locals.db_3, req.body);
		addEpisode.then(data => res.redirect('/'+admin_link + '/manage?type=episode&action=list&id='+req.body.id));
	}else if (req.body.mode == 'edit') {
		let editEpisode = toolFilmMd.editEpOne(req.app.locals.db_3, req.body);
		editEpisode.then(data => res.redirect('/'+admin_link + '/manage?type=episode&action=list&id='+req.body.id))
	}else{
		res.redirect('/'+admin_link + '/manage?type=episode&action=list&id='+req.body.id);	
	}
});
router.post("/config/custom/", function(req, res){
	let admin_link = "admin";
	jsonConfig.custom = req.body;
	fs.writeFile('config/default.json', JSON.stringify(jsonConfig), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=config&action=custom');
	});
});
router.post("/config/database/", function(req, res){
	let admin_link = "admin";
	jsonConfig.database = req.body;
	fs.writeFile('config/default.json', JSON.stringify(jsonConfig), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=config&action=database');
	});
});
router.post("/config/security/", function(req, res){
	let admin_link = "admin";
	jsonConfig.security = req.body;
	fs.writeFile('config/default.json', JSON.stringify(jsonConfig), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=config&action=security');
	});
});
router.post("/config/advanced/", function(req, res){
	let admin_link = "admin";
	jsonConfig.advanced = req.body;
	fs.writeFile('config/default.json', JSON.stringify(jsonConfig), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=config&action=advanced');
	});
});
router.post("/config/number-movie/", function(req, res){
	let admin_link = "admin";
	jsonConfig.number_movie = req.body;
	fs.writeFile('config/default.json', JSON.stringify(jsonConfig), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=config&action=number-movie');
	});
});
router.post("/config/home/", function(req, res){
	let admin_link = "admin";
	jsonConfig.home = req.body;
	fs.writeFile('config/default.json', JSON.stringify(jsonConfig), function (err) {
		if (err) throw err;
		res.redirect('/'+admin_link + '/manage?type=config&action=home');
	});
});

// AUTH
router.post("/auth/login", async function(req, res){
  if(!req.body.username && !req.body.password) return res.json({ status: false });
	if((req.body.username !== process.env.ADMIN_ACCOUNT) || (req.body.password !== process.env.ADMIN_PASSWORD)) return res.json({ status: false });
  const accessToken = await jwtHelper.generateToken('admin', process.env.SECURITY_JWT, process.env.SECURITY_JWT_LIFE);
  res.json({ status: true, token: accessToken });
});
router.post("/auth/check", async function(req, res){
  try{
    if(!req.body.token) return res.json({ status: false });
    const checkToken = await jwtHelper.verifyToken(req.body.token, process.env.SECURITY_JWT);
    res.json({ status: true });
  }catch (error) {
    // console.log(error)
    return res.json({ status: false });
  }
});


// Thêm bình luận
router.post('/manage/add-comment', function(req, res){
    customMd.addComment(req.app.locals.db_5, req.body, req.headers['authorization'])
        .then((data) => {
            const dataComment = data.ops[0];
            dataComment["u_name"] = 'ADMIN HAYPHIM';
            dataComment["u_img"] = 'https://i.imgur.com/9l2hhvh.png';
            if (req.body.mode === 'comment') {
                dataComment['nLike'] = 0;
                dataComment['nComment'] = 0;
                dataComment['isLike'] = false;
                dataComment['reply'] = true;
                return res.json({ status: true, data: dataComment });
            }
            res.json({ status: true, data: dataComment });
        })
        .catch (err => res.json({ status: false }));
});
// Lấy danh sách bình luận
router.post("/manage/comment", function (req, res) {
  customMd
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
      customMd
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


// CURD bình luận
router.post('/manage/curd-comment', function(req, res){
    customMd.curdComment(req.app.locals.db_5, req.body.id, req.body.idParent, req.body.mode, req.headers['authorization'])
        .then((data) => {
            res.json({ status: true });
        })
        .catch (err => res.json({ status: false }));
});

// tìm kiếm phim
router.post("/search", function(req, res){
    if(req.body.q){
        customMd.getFilmHome(req.app.locals.db_1, req.body.q, req.body.o, req.body.so ||"'other.p_at': -1", Number(req.body.l), Number(req.body.s))
        .then((data) => {
            res.json({ data: data });
        })
        .catch (() => res.json( { data: false }));
    }else{
        res.json( { data: null } );
    }
});
// tìm kiếm diễn viên
router.post("/search-cast", function(req, res){
    customMd.searchCast(req.app.locals.db_4, req.body.q, Number(req.body.l))
    .then((data) => {
        res.json({ data: data });
    })
    .catch (() => res.json( { data: false }));
});

module.exports = router;