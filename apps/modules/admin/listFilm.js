// Lấy danh sách phim kèm tổng số phim -- Đã bị bỏ ờ v2 khi dùng vuejs
function getList(db, query, projection, limit, skip){
    const dbo = db.db(process.env.DB_SV_1);
    query = eval('({' + query + '})');
    projection = eval('({' + projection + '})');
    return Promise.all([dbo.collection(process.env.CL_INFO_MOVIE).countDocuments(), dbo.collection(process.env.CL_INFO_MOVIE).find( query, {projection: projection} ).sort({'other.p_at': -1}).limit(limit).skip(skip).toArray()]);
}
// Lấy danh sách phim
function getListMovie(db, query, projection, limit, skip){
    const dbo = db.db(process.env.DB_SV_1);
    query = eval('({' + query + '})');
    projection = eval('({' + projection + '})');
    return dbo.collection(process.env.CL_INFO_MOVIE).find( query, {projection: projection} ).sort({'other.p_at': -1}).limit(limit).skip(skip).toArray();
}

module.exports = {
    getList,
    getListMovie
}