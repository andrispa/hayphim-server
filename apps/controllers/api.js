const express = require("express");
const rewrite = require('express-urlrewrite');
// const cors = require("cors");
const router = express.Router();
const toolFilmMd = require('../modules/admin/toolFilm'),
customMd = require('../modules/admin/other');
const toolGrab = require('../modules/site/grab');
const dbMd = require('../modules/site/home');
const Configstore = require('configstore');
// router.get("/cache-:id", function(req, res){
// 	res.json({'cache': appCache.get(req.params.id) });
// });
// let wl = ['https://localhost'];
// let corsOp = {
//   origin: function (origin, callback) {
//     if (wl.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback('Đừng yêu nữa, Em mệt rồi xD', true);
//     }
//   },
//   optionsSuccessStatus: 200,
// }
// router.use(cors(corsOp));
//get link player tập
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.post("/", function(req, res){
    if (req.body.value && req.body.orign) {
        const playCache = new Configstore(req.body.id),
        errorMess = {'status': 'error', 'mess': 'Tập phim không tồn tại trong máy chủ'};
        let a = '';
        if ( playCache.has('data') && 900000 > ( new Date() - new Date(playCache.get('data').timeCreate) ) ) {
            const { episode } = playCache.get('data');
            if (episode && req.body.value < episode.length) {
                console.log('dùng cache');
                switch (req.body.orign) {
                    case '1':
                        a = episode[req.body.value].p.split('**');
                        if (req.body.meo < a.length) {res.json({"status": "ok", "type": "orign", "drirect": a[req.body.meo]});
                        }else{
                            res.json(errorMess);
                        }
                        break;
                    case '2':
                        a = episode[req.body.value].d.split('**');
                        if (req.body.meo < a.length) {res.json({'status': 'ok', "type": "drive", 'drirect': a[req.body.meo]});
                        }else{
                            res.json(errorMess);
                        }
                        break;
                    case '3':
                        a = episode[req.body.value].e.split('**');
                        if (req.body.meo < a.length) {res.json({'status': 'ok', "type": "embed", 'ep': a[req.body.meo]});}
                        else{
                            res.json(errorMess);
                        }
                        break;  
                    case 'auto':
                        if (episode[req.body.value].p) {res.json({"status": "ok", "type": "orign", "drirect": episode[req.body.value].p.split('**')[0]});}
                        else if (episode[req.body.value].d) {res.json({"status": "ok", "type": "drive", "drirect": episode[req.body.value].d.split('**')[0]})}
                        else if (episode[req.body.value].e) {res.json({'status': 'ok', "type": "embed", 'ep': episode[req.body.value].e.split('**')[0]})}
                        break;  
                    default:
                        res.json(errorMess);
                        break;
                }  
            } else {
                res.json(errorMess);
            }
        } else {
            console.log('không dùng cache');
            toolFilmMd.getListEp(req.app.locals.db_3, req.body.id, '')
            .then((data) =>{
                data.l.sort((a, b) =>{return a.t - b.t});
                // playCache.set('data_play', { episode: data.l, timeCreate: new Date() });
                if (req.body.value < data.l.length) {
                    switch (req.body.orign) {
                        case '1':
                            a = data.l[req.body.value].p.split('**');
                            if (req.body.meo < a.length) {res.json({"status": "ok", "type": "orign", "drirect": a[req.body.meo]});
                            }else{
                                res.json(errorMess);
                            }
                            break;
                        case '2':
                            a = data.l[req.body.value].d.split('**');
                            if (req.body.meo < a.length) {res.json({'status': 'ok', "type": "drive", 'drirect': a[req.body.meo]});
                            }else{
                                res.json(errorMess);
                            }
                            break;
                        case '3':
                            a = data.l[req.body.value].e.split('**');
                            if (req.body.meo < a.length) {res.json({'status': 'ok', "type": "embed", 'ep': a[req.body.meo]});}
                            else{
                                res.json(errorMess);
                            }
                            break;  
                        case 'auto':
                            if (data.l[req.body.value].p) {res.json({"status": "ok", "type": "orign", "drirect": data.l[req.body.value].P.split('**')[0]});}
                            else if (data.l[req.body.value].d) {res.json({"status": "ok", "type": "drive", "drirect": data.l[req.body.value].d.split('**')[0]})}
                            else if (data.l[req.body.value].e) {res.json({'status': 'ok', "type": "embed", 'ep': data.l[req.body.value].e.split('**')[0]})}
                            break;  
                        default:
                            res.json(errorMess);
                            break;
                    }  
                } else {
                    res.json(errorMess);
                }
            })
            .catch(() =>{
                res.json({'status': 'error', 'mess': 'Không có dữ liệu'});
            });
        }
        
    }

});





// router.post("/", function(req, res){
//     if (req.body.value && req.body.orign) {
//         const playCache = new Configstore(req.body.id),
//         errorMess = {'status': 'error', 'mess': 'Tập phim không tồn tại trong máy chủ'};
//         let a = '';
//         if ( playCache.has('data') && 900000 > ( new Date() - new Date(playCache.get('data').timeCreate) ) ) {
//             const { episode } = playCache.get('data');
//             if (req.body.value < episode.length) {
//                 console.log('dùng cache');
//                 switch (req.body.orign) {
//                     case '1':
//                         a = episode[req.body.value].p.split('**');
//                         if (req.body.meo < a.length) {
//                             let getGP =  toolGrab.getGP(a[req.body.meo]);
//                             getGP.then((data)=>{
//                                 return res.json({"status": "ok", "type": "orign", "drirect": data});
//                             })
//                             .catch(()=>{
//                                 res.json(errorMess);
//                             });
//                         }else{
//                             res.json(errorMess);
//                         }
//                         break;
//                     case '2':
//                         a = episode[req.body.value].d.split('**');
//                         if (req.body.meo < a.length) {res.json({'status': 'ok', 'ep': a[req.body.meo]});
//                         }else{
//                             res.json(errorMess);
//                         }
//                         break;
//                     case '3':
//                         a = episode[req.body.value].e.split('**');
//                         if (req.body.meo < a.length) {res.json({'status': 'ok', "type": "embed", 'ep': a[req.body.meo]});}
//                         else{
//                             res.json(errorMess);
//                         }
//                         break;  
//                     case 'auto':
//                         if (episode[req.body.value].p) {
//                             let getGP =  toolGrab.getGP(episode[req.body.value].p.split('**')[0]);
//                             getGP.then((data)=>{
//                                 res.json({"status": "ok", "type": "orign", "drirect": data});
//                             })
//                             .catch(()=>{
//                                 res.json(errorMess);
//                             });
//                         }
//                         else if (episode[req.body.value].d) {res.json({"status": "ok", "type": "drive", "drirect": episode[req.body.value].d.split('**')[0]})}
//                         else if (episode[req.body.value].e) {res.json({'status': 'ok', "type": "embed", 'ep': episode[req.body.value].e.split('**')[0]})}
//                         break;  
//                     default:
//                         res.json(errorMess);
//                         break;
//                 }  
//             } else {
//                 res.json(errorMess);
//             }
//         } else {
//             console.log('không dùng cache');
//             toolFilmMd.getListEp(req.app.locals.db_3, req.body.id, '')
//             .then((data) =>{
//                 data.l.sort((a, b) =>{return a.t - b.t});
//                 // playCache.set('data_play', { episode: data.l, timeCreate: new Date() });
//                 if (req.body.value < data.l.length) {
//                     switch (req.body.orign) {
//                         case '1':
//                             a = data.l[req.body.value].p.split('**');
//                             if (req.body.meo < a.length) {
//                                 let getGP =  toolGrab.getGP(a[req.body.meo]);
//                                 getGP.then((data)=>{
//                                     return res.json({"status": "ok", "type": "orign", "drirect": data});
//                                 })
//                                 .catch(()=>{
//                                     res.json(errorMess);
//                                 });
//                             }else{
//                                 res.json(errorMess);
//                             }
//                             break;
//                         case '2':
//                             a = data.l[req.body.value].d.split('**');
//                             if (req.body.meo < a.length) {res.json({'status': 'ok', 'ep': a[req.body.meo]});
//                             }else{
//                                 res.json(errorMess);
//                             }
//                             break;
//                         case '3':
//                             a = data.l[req.body.value].e.split('**');
//                             if (req.body.meo < a.length) {res.json({'status': 'ok', "type": "embed", 'ep': a[req.body.meo]});}
//                             else{
//                                 res.json(errorMess);
//                             }
//                             break;  
//                         case 'auto':
//                             if (data.l[req.body.value].p) {
//                                 let getGP =  toolGrab.getGP(data.l[req.body.value].p.split('**')[0]);
//                                 getGP.then((data)=>{
//                                     res.json({"status": "ok", "type": "orign", "drirect": data});
//                                 })
//                                 .catch(()=>{
//                                     res.json(errorMess);
//                                 });
//                             }
//                             else if (data.l[req.body.value].d) {res.json({"status": "ok", "type": "drive", "drirect": data.l[req.body.value].d.split('**')[0]})}
//                             else if (data.l[req.body.value].e) {res.json({'status': 'ok', "type": "embed", 'ep': data.l[req.body.value].e.split('**')[0]})}
//                             break;  
//                         default:
//                             res.json(errorMess);
//                             break;
//                     }  
//                 } else {
//                     res.json(errorMess);
//                 }
//             })
//             .catch(() =>{
//                 res.json({'status': 'error', 'mess': 'Không có dữ liệu'});
//             });
//         }
        
//     }

// });
// get danh sách tập
router.post("/totalEp", function(req, res){
    function getListServer(data){
        const listServser = [];
        for (const iterator of data) {
            const numberServer = [];
            iterator.p ? numberServer.push(iterator.p.split('**').length) : numberServer.push(0);
            iterator.d ? numberServer.push(iterator.d.split('**').length) : numberServer.push(0);
            iterator.e ? numberServer.push(iterator.e.split('**').length) : numberServer.push(0);
            listServser.push(numberServer);
        }
        return listServser;
    }
    if(req.body.id){
        const epCache = new Configstore(req.body.id);
        if ( epCache.has('data') && epCache.has('episode') && 900000 > ( new Date() - new Date(epCache.get('data').timeCreate) ) ) {
            console.log('dùng cache EP');
            const { status, listEP, listSV } = epCache.get('episode');
            res.json({status: status, server: listSV, total: listEP});
        }else{
            console.log('không dùng cache ep');
            toolFilmMd.getListEp(req.app.locals.db_3, req.body.id, '"l": 1, _id: 0')
            .then((data)=>{
                data.l.sort((a, b) =>{return a.t - b.t});
                const listEP = [];
                const listSV = getListServer(data.l);
                for (const key in data.l) { 
                    listEP.push(data.l[key].t);
                }
                epCache.set('data', { 
                    status: 'ok',
                    episode: data.l,
                    listEP: listEP,
                    listSV: listSV,
                    timeCreate: new Date() 
                });
                res.json({status: 'ok', server: listSV, total: listEP});
            })
            .catch(() => {
                epCache.set('data', { 
                    status: 'erorr',
                    episode: null,
                    listEP: 'Không tìm thấy cái gì hết luôn á -_-',
                    listSV: null,
                    timeCreate: new Date() 
                });
                res.json({status: 'error', total: 'Không tìm thấy cái gì hết luôn á -_-'});
            });
        }
    }else{
        res.json({status: 'error', total: 'ơ ID đâu, không có ID thì tôi tìm bằng gì? -_-'});
    }

});
//lấy thông tin phim
router.post("/info-movie", function(req, res){
    dbMd.getInfoOne(req.app.locals.db_1, 'url: "'+req.body.url+'"', "url: 1, 'img.poster': 1, name: 1, c_c: 1, dir: 1, 'status.s': 1, 'status.r': 1, 'status.l': 1, 'content': 1, 'other.view': 1, 'other.d': 1, 'other.t_film': 1, 'other.year': 1, 't_l.t_f' : 1")
	.then((data) =>{
        res.setHeader("Cache-Control", "public, max-age=2592000");
        res.setHeader("Expires", new Date(Date.now() + 43200000).toUTCString());
		res.json(data.value);
	});
});


// thêm đánh giá
router.post("/add-rating", function(req, res){
    if (req.headers.origin != 'https://localhost') return res.status(401).send('Đừng yêu nữa, Em mệt rồi xD');
    else{
        dbMd.addRating(req.app.locals.db_2, req.body.meomeo, req.body.rating)
        .then(data => res.json({ 'status': 'Done'}))
        .catch(err => res.json({ 'status': 'Error'}));
    }
});
// lấy thông tin đánh giá
router.post("/get-rating", function(req, res){
    dbMd.getRating(req.app.locals.db_2, req.body.meomeo)
    .then(data => res.json({ 'status': 'Done', 'rating': data.star }))
    .catch(err => res.json({ 'status': 'Done', 'rating': [0] }));
});
// ghi nhận báo lỗi tập phim
router.post("/add-report", function(req, res){
    dbMd.addReportError(req.app.locals.db_2, req.body.meomeo, req.body.data)
    .then(data => res.json({ 'status': 'Done'}))
    .catch(err => res.json({ 'status': 'Error'}));
});
// get list phim
router.post("/get-list-movie", function(req, res){
    if(req.body.id){
        const appCache = req.app.locals.appCache;
        if( appCache.has(req.body.id) ){
            res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + 900000).toUTCString());
            return res.json( { 'status': 'Done', 'data': appCache.get(req.body.id) } );
        }else{
            dbMd.getFilmHome(req.app.locals.db_1, req.body.query, req.body.option, req.body.sort || "'other.p_at': -1", Number(req.body.limit), Number(req.body.skip))
            .then((data) => {
                appCache.set(req.body.id, data);
                res.setHeader("Cache-Control", "public, max-age=2592000");
                res.setHeader("Expires", new Date(Date.now() + 900000).toUTCString());
                res.json({ 'status': 'Done', 'data': data });
            })
            .catch (err => res.json({ 'status': 'error', 'mess': 'null' }));
        }
    }else{
        dbMd.getFilmHome(req.app.locals.db_1, req.body.query, req.body.option, req.body.sort || "'other.p_at': -1", Number(req.body.limit), Number(req.body.skip))
            .then( (data) => {
                res.setHeader("Cache-Control", "public, max-age=2592000");
                res.setHeader("Expires", new Date(Date.now() + 900000).toUTCString());
                res.json( { 'status': 'Done', 'data': data } )
            })
            .catch ( err => res.json( { 'status': 'error', 'mess': 'null' } ) );
    }
});
// tìm kiếm
router.post("/search/", function(req, res){
    if(req.body.q){
        dbMd.getFilmHome(req.app.locals.db_1, req.body.q, req.body.o, "'other.p_at': -1", Number(req.body.l), Number(req.body.s))
        .then((data) => {
            res.json({ data: data });
        })
        .catch (err => res.json( { data: err }));
    }else{
        res.json( { data: 'null' } );
    }
});
// get total number movie 
router.post("/get-number-movie/", function(req, res){
	toolFilmMd.count(req.app.locals.db_1, req.body.query)
	.then(data => res.json({ 'status': 'Done', 'data': data }))
    .catch (err => res.json({ 'status': 'error', 'mess': 'null' }));
});
//get server status 3 server
router.post("/get-server-status-1", function(req, res){
	toolFilmMd.serverStatus(req.app.locals.db_1, 'database.db_sv_1')
	.then(data => res.json({'status': 'ok', uptime: data.uptime ,connections: data.connections, opcounters: data.opcounters}))
    .catch (err => res.json({ 'status': 'error', 'mess': 'null' }));
});
router.post("/get-server-status-2", function(req, res){
	toolFilmMd.serverStatus(req.app.locals.db_2, 'database.db_sv_2')
	.then(data => res.json({'status': 'ok', uptime: data.uptime ,connections: data.connections, opcounters: data.opcounters}))
    .catch (err => res.json({ 'status': 'error', 'mess': 'null' }));
});
router.post("/get-server-status-3", function(req, res){
	toolFilmMd.serverStatus(req.app.locals.db_3, 'database.db_sv_3')
	.then(data => res.json({'status': 'ok', uptime: data.uptime ,connections: data.connections, opcounters: data.opcounters}))
    .catch (err => res.json({ 'status': 'error', 'mess': 'null' }));
});
router.post("/delete-cache", function(req, res){
	res.json({'deleted': (req.app.locals.appCache).del(req.body.id) });
});
router.get("/delete-cache", function(req, res){
	res.json({'deleted': (req.app.locals.appCache).keys() });
});
module.exports = router;