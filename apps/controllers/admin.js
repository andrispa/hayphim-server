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
v2t = {};
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
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

// CATEGORY CURD //
router.post("/manage/get-list-category", function(req, res){
	customMd.getListCategory(req.app.locals.db_4)
	.then((data) =>{
		res.json(data.category || []);
	})
	.catch( err => res.json({ err: err }));
});
router.post("/manage/curd-category", function(req, res){
	customMd.CURDCategory(req.app.locals.db_4, req.body.category)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: err }));
});

//  COUNTRY CURD
router.post("/manage/get-list-country", function(req, res){
	customMd.getListCountry(req.app.locals.db_4)
	.then((data) =>{
		res.json(data.country || []);
	})
	.catch( err => res.json({ err: err }));
});
router.post("/manage/curd-country", function(req, res){
	customMd.CURDCountry(req.app.locals.db_4, req.body.country	)
	.then((data) =>{
		res.json(data);
	})
	.catch( err => res.json({ err: err }));
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

// CUSTOM CURD
router.post("/manage/get-list-custom", function(req, res){
	customMd.getCustom(req.app.locals.db_4, req.body.type)
	.then(data => res.json(data[req.body.type] || {}))
	.catch( err => res.json({ err: 'Lấy thông tin custom basic thất bại' }));
});
router.post("/manage/curd-custom", function(req, res){
	customMd.CURDCustom(req.app.locals.db_4, req.body.type, JSON.parse(req.body.params))
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
module.exports = router;