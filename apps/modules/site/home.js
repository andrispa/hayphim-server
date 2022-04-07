const ObjectID = require('mongodb').ObjectID;
const JWT = require('../../helpers/jwt.helper');

// Lấy danh sách phim
function getFilmHome(db, query, projection, sort, limit, skip){
    const dbo = db.db(process.env.DB_SV_1);
    query = eval('({' + query + '})');
    projection = eval('({' + projection + '})');
    sort = eval('({' + sort + '})');
    return dbo.collection(process.env.CL_INFO_MOVIE).find( query, {projection: projection} ).sort(sort).limit(limit).skip(skip).toArray();
}
// Lấy thông tin chi tiết của phim
function getInfoOne(db, query, projection){
    const dbo = db.db(process.env.DB_SV_1);
    query = eval('({' + query + '})');
    projection = eval('({' + projection + '})');
    return dbo.collection(process.env.CL_INFO_MOVIE).findOneAndUpdate( query, { $inc: { "other.view": parseInt(1) } }, {projection: projection} );
}
// Tăng số lượt yêu thích của phim
function addLoveMovie(db, id){
    const dbo = db.db(process.env.DB_SV_1);
    return dbo.collection(process.env.CL_INFO_MOVIE).updateOne( { _id: ObjectID(id) }, { $inc: { "other.love": parseInt(1) } } );
}

// Báo cáo phim lỗi
function addReportMovie(db, params){
    if (!db || !ObjectID.isValid(params.id) || !params.name || !params.url || !params.error) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    const dbo = db.db(process.env.DB_SV_2);
    return dbo.collection(process.env.CL_REPORT_EPISODE_ERROR).updateOne({ "_id" : ObjectID(params.id) },{ $set: { name: params.name, url: params.url }, $addToSet: { error: { $each: [ JSON.parse(params.error) ] } } }, {upsert: true} );
}
// Thêm bình luận
async function addComment(db, params, token) {
    if (!db || !params.content || !params.id_m && !params.id_commnent || !params.mode || !token) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    const { data } = await JWT.verifyToken(token.split('Bearer ')[1], 'meocoder');
    const dataComment = {};
    const dbo = db.db(process.env.DB_SV_5);
    switch (params.mode) {
        case 'comment':
            try {
                ObjectID.isValid(params.id_m) ? null : mecoder -1;
                dataComment['content'] = params.content;
                dataComment['id_m'] = params.id_m;
                dataComment['time'] = new Date();
                dataComment['u_name'] = data.name,
                data.type === 'fb' ? dataComment['u_img'] = data.id : null;
                dataComment['id_u'] = data._id || data.id;
                return dbo.collection(process.env.CL_COMMENT).insertOne(dataComment);
            } catch (error) {
                return new Promise((resolve, reject) => {
                    reject({ code: error })
                });
            }
        case 'reply':
            try {
                ObjectID.isValid(params.id_commnent) ? null : mecoder -1;
                params.repliesUser ? dataComment['p_name'] = params.repliesUser : null;
                dataComment['content'] = params.content;
                dataComment['id_parent'] = params.id_commnent;
                dataComment['time'] = new Date();
                dataComment['u_name'] = data.name,
                data.type === 'fb' ? dataComment['u_img'] = data.id : null;
                dataComment['id_u'] = data._id || data.id;
                await dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(params.id_commnent) }, { $inc: { "nComment": parseInt(1) } } );
                return dbo.collection(process.env.CL_COMMENT).insertOne(dataComment);
            } catch (error) {
                return new Promise((resolve, reject) => {
                    reject({ code: error })
                });
            }
        default:
            return new Promise((resolve, reject) => {
                reject({ code: error })
            });
    }
}
// Lấy danh sách bình luận
function getListComment(db, id, sort, limit, skip, mode) {
    if (!db || !id || !mode) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    sort = eval('({' + sort + '})');
    const dbo = db.db(process.env.DB_SV_5);
    switch (mode) {
        case 'comment':
            return Promise.all([ dbo.collection(process.env.CL_COMMENT).find( { id_m: id } ).sort(sort).limit(limit || 5).skip(skip || 0).toArray(), dbo.collection(process.env.CL_COMMENT).countDocuments( { id_m: id } ) ]);
        case 'reply':
            return Promise.all([ dbo.collection(process.env.CL_COMMENT).find( { id_parent: id } ).sort(sort).limit(limit || 5).skip(skip || 0).toArray(), dbo.collection(process.env.CL_COMMENT).countDocuments( { id_parent: id } ) ]);
        default:
            return new Promise((resolve, reject) => {
                reject({ code: 0 })
            });
    }
}
// Tương tác bình luận
async function reactionComment(db, id, mode, token) {
    if (!db || !id || !ObjectID.isValid(id) || !mode || !token) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    const dbo = db.db(process.env.DB_SV_5);
    const { data } = await JWT.verifyToken(token.split('Bearer ')[1], 'meocoder');
    try {
        switch (mode) {
            case 'like':
                return dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(id) }, { $addToSet: { like: { $each: [ data._id || data.id ] } } } );
            case 'report':
                return dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(id) }, { $set: { isReport: true } } );
            default:
                return new Promise((resolve, reject) => {
                    reject({ code: 0 })
                });
        }
    } catch (error) {
        return new Promise((resolve, reject) => {
            reject({ code: error })
        });
    }
}

// Lấy danh sách diễn viên tham gia trong phim
function getListCastMovie(db, idmovie){
    if (!db || !idmovie) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CAST).find({ movie: { $in: [ idmovie ] } }, { projection: { name: 1, img: 1 } }).toArray();
}
// Lấy danh sách phim tham gia của diễn viên
async function getListMovieInCast(db, db_4, name, sort, limit, skip){
    if (!db || !db_4 || !name) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo_4 = db_4.db(process.env.DB_SV_4);
    const { movie } = await dbo_4.collection(process.env.CL_CAST).findOne({ name: name }, { projection: { movie: 1, _id: 0 } });
    if (movie) {
        const arrayID = [];
        movie.forEach(element => {
            arrayID.push(ObjectID(element));
        });
        sort = eval('({' + sort + '})');
        const dbo = db.db(process.env.DB_SV_1);
        return dbo.collection(process.env.CL_INFO_MOVIE).find( { _id: { $in: arrayID } }, { projection: { "url": 1, "img.poster": 1, "name.vn": 1, "name.en": 1, "status.r": 1, "status.s": 1, "status.l": 1, "other.view": 1, "other.t_film": 1, "_id": 0 } } ).sort(sort).limit(limit).skip(skip).toArray();
    } else {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
}
// Tìm kiếm diễn viên theo tên
function searchCast(db, query, limit){
    if (!db || !query) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    query = eval('({' + query + '})');
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CAST).find(query, { projection: { name: 1, img: 1 } }).limit(limit || 3).skip(0).toArray();
}
// Lấy danh sách tập của phim
function getListEp(db, id, projection){
    if (!db || !id) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    projection = eval('({' + projection + '})');
    const dbo = db.db(process.env.DB_SV_3);
    return dbo.collection(process.env.CL_EPISODE).findOne({ "_id" : ObjectID(id) }, { projection: projection });
}
// Lấy dánh sách thông tin tùy chỉnh của trang
function getCustom(db){
    if (!db) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CUSTOM).findOne({ "_id": 'data' }, { projection: { _id: 0 } });
}
module.exports = {
    getFilmHome,
    getInfoOne,
    addLoveMovie,
    addReportMovie,
    getListCastMovie,
    getListMovieInCast,
    searchCast,
    getListEp,
    addComment,
    getListComment,
    reactionComment,
    getCustom
}