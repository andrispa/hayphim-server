const ObjectID = require('mongodb').ObjectID;

// Thêm sửa xóa cập nhật thể loại //
function getListCategory(db){
    if (!db) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CUSTOM).findOne({ "_id": 'data' }, { projection: { category: 1 } });
}
function CURDCategory(db, params){
    if (!db || !params) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CUSTOM).updateOne({ "_id": 'data' }, { $set: { category: JSON.parse(params) } }, { upsert: true });
}


// Thêm sửa xóa cập nhật quốc gia //
function getListCountry(db){
    if (!db) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CUSTOM).findOne({ "_id": 'data' }, { projection: { country: 1 } });
}
function CURDCountry(db, params){
    if (!db || !params) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CUSTOM).updateOne({ "_id": 'data' }, { $set: { country: JSON.parse(params) } }, { upsert: true });
}


// **  Thêm sửa xóa cập nhật diễn viên ** //

// * Lấy danh sách diễn viên * // 
function getListCast(db, limit, skip){
    if (!db || !limit || !skip) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CAST).find({}, { projection: { name: 1, country: 1 } }).limit(parseInt(limit)).skip(parseInt(skip)).toArray();
}
// * Thêm diễn viên * // 
function addCast(db, params){
    if (!db || !params) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const data = {};
    params.name ? data['name'] = params.name: 'Chưa rõ';
    params.name_other ? data['name_other'] = params.name_other: null;
    params.birthday ? data['birthday'] = params.birthday: null;
    params.village ? data['village'] = params.village: null;
    params.height ? data['height'] = params.height: null;
    params.manage ? data['manage'] = params.manage: null;
    params.debut ? data['debut'] = params.debut: null;
    params.img ? data['img'] = params.img: null;
    params.hot ? data['hot'] = params.hot: null;
    params.description ? data['description'] = params.description: null;
    params.school ? data['school'] = params.school: null;
    params.country ? data['country'] = params.country: null;
    const dbo = db.db(process.env.DB_SV_4);
    dbo.collection(process.env.CL_CAST).createIndex({'name': 1}, { "unique": true });
    return dbo.collection(process.env.CL_CAST).insertOne( data );
}
// * Lấy thông tin diễn viên * // 
function getInfoCast(db, id){
    if (!db || !id) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CAST).findOne({ "_id" : ObjectID(id) });
}
// * Chỉnh sửa diễn viên * // 
function editCast(db, params){
    if (!db || !params || !params._id) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const data = {};
    params.name ? data['name'] = params.name: 'Chưa rõ';
    params.name_other ? data['name_other'] = params.name_other: null;
    params.birthday ? data['birthday'] = params.birthday: null;
    params.village ? data['village'] = params.village: null;
    params.height ? data['height'] = params.height: null;
    params.manage ? data['manage'] = params.manage: null;
    params.debut ? data['debut'] = params.debut: null;
    params.img ? data['img'] = params.img: null;
    params.hot ? data['hot'] = params.hot: null;
    params.description ? data['description'] = params.description: null;
    params.school ? data['school'] = params.school: null;
    params.country ? data['country'] = params.country: null;
    const dbo = db.db(process.env.DB_SV_4);
    dbo.collection(process.env.CL_CAST).createIndex({'name': 1}, { "unique": true });
    return dbo.collection(process.env.CL_CAST).updateOne({ "_id" : ObjectID(params._id) }, { $set: data });
}
// * Xóa một diễn viên * // 
function deleteCast(db, id){
    if (!db || !id) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(process.env.CL_CAST).deleteOne({ "_id" : ObjectID(id) });
}
// * Xóa nhiều diễn viên * // 
function deleteCasts (db, arrayID){
    if (!db || !arrayID) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const arrayObjectID = [];
    JSON.parse(arrayID).forEach((id) => {
        arrayObjectID.push(new ObjectID(id));
    });
    let dbo = db.db(process.env.DB_SV_4);
    return dbo.collection(config.get("database.CL_CAST")).deleteMany({ "_id" : { $in: arrayObjectID } });
}

// **  Thông tin trang web ** //

// Lấy thông tin tùy chỉnh //
function getCustom(db, type){
    if (!db || !type) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    switch (type) {
        case 'basic':
            return dbo.collection(process.env.CL_CUSTOM).findOne({ "_id": 'data' }, { projection: { basic: 1 } });
        case 'advance':
            return dbo.collection(process.env.CL_CUSTOM).findOne({ "_id": 'data' }, { projection: { advance: 1 } });
        default:
            return new Promise((resolve, reject) => {
                reject({ code: 0 })
            })
    }
}
// Thêm sửa xóa cập nhật tùy chỉnh thông tin trang web //
function CURDCustom(db, type, params){
    if (!db || !type || !params) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_4);
    switch (type) {
        case 'basic':
            return dbo.collection(process.env.CL_CUSTOM).updateOne({ "_id": 'data' }, { $set: { basic: params } }, { upsert: true });
        case 'advance':
            return dbo.collection(process.env.CL_CUSTOM).updateOne({ "_id": 'data' }, { $set: { advance: params } }, { upsert: true });
        default:
            return new Promise((resolve, reject) => {
                reject({ code: 0 })
            })
    }
}

// Thêm sửa xóa cập nhật thành viên //
function getListUser(db, limit, skip){
    if (!db || !limit || !skip) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const dbo = db.db(process.env.DB_SV_2);
    return dbo.collection(process.env.CL_USERS).find({}, { projection: { name: 1, email: 1, type: 1, ban: 1, avatar: 1 } }).limit(parseInt(limit)).skip(parseInt(skip)).toArray();
}
function CURDUser(db, type, arrayID){
    if (!db || !type || !arrayID) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        })
    }
    const arrayObjectID = [];
    JSON.parse(arrayID).forEach((id) => {
        arrayObjectID.push(new ObjectID(id));
    });
    const dbo = db.db(process.env.DB_SV_2);
    switch (type) {
        case 'ban':
            return dbo.collection(process.env.CL_USERS).updateMany({ "_id": { $in: arrayObjectID } }, { $set: { ban: 1 } });
        case 'unban':
            return dbo.collection(process.env.CL_USERS).updateMany({ "_id": { $in: arrayObjectID } }, { $unset: { ban: 1 } });
        default:
            return new Promise((resolve, reject) => {
                reject({ code: 0 })
            })
    }
}


module.exports = {
    getListCategory,
    CURDCategory,
    getListCountry,
    CURDCountry,
    getListCast,
    addCast,
    getInfoCast,
    editCast,
    deleteCast,
    deleteCasts,
    getCustom,
    CURDCustom,
    getListUser,
    CURDUser
}