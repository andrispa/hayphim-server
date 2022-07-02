// let config = require('config');
// let q = require('q');
let helpers = require("../../helpers/convert");
let ObjectID = require("mongodb").ObjectID;

// ** COUNT MOVIE ** //
function count(db, query) {
  let dbo = db.db(process.env.DB_SV_1);
  query = eval("({" + query + "})");
  return dbo.collection(process.env.CL_INFO_MOVIE).countDocuments(query);
}

// ** COUNT MOVIE NEW ** //
function countMovie(db) {
  if (!db) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_1);
  return Promise.all([
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [{ "t_l.t_f": 0 }, { "c_c.ca": { $nin: ["19"] } }],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [{ "t_l.t_f": 1 }, { "c_c.ca": { $nin: ["19"] } }],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [
          { $or: [{ "t_l.t_f": 0 }, { "t_l.t_f": 1 }] },
          { "c_c.ca": { $in: ["19"] } },
        ],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [{ "t_l.t_f": 2 }, { "c_c.ca": { $nin: ["19"] } }],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [{ "t_l.t_f": 3 }, { "c_c.ca": { $nin: ["19"] } }],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [
          { $or: [{ "t_l.t_f": 2 }, { "t_l.t_f": 3 }] },
          { "c_c.ca": { $in: ["19"] } },
        ],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [
          { $or: [{ "t_l.t_f": 0 }, { "t_l.t_f": 1 }] },
          { "c_c.ca": { $in: ["v6"] } },
          { "c_c.ca": { $nin: ["19"] } },
        ],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [
          { $or: [{ "t_l.t_f": 2 }, { "t_l.t_f": 3 }] },
          { "c_c.ca": { $in: ["v6"] } },
          { "c_c.ca": { $nin: ["19"] } },
        ],
      }),
    dbo
      .collection(process.env.CL_INFO_MOVIE)
      .countDocuments({
        $and: [{ "c_c.ca": { $in: ["v6"] } }, { "c_c.ca": { $in: ["19"] } }],
      }),
  ]);
}

// * GET INFO MOVIES * //
function getInfoFilm(db, db_4, id) {
  if (!db || !db_4 || !id) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_1);
  const dbo_4 = db_4.db(process.env.DB_SV_4);
  return Promise.all([
    dbo.collection(process.env.CL_INFO_MOVIE).findOne({ _id: ObjectID(id) }),
    dbo_4
      .collection(process.env.CL_CAST)
      .find({ movie: { $in: [id] } }, { projection: { name: 1, _id: 0 } })
      .toArray(),
  ]);
}

// * CURD MOVIES * //

// * ADD MOVIE * //
function addFilm(db, params) {
  if (!db || !params) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  // Create array info
  let update = {},
    img = {},
    name = {},
    status = {},
    c_c = {},
    content = {},
    t_l = {},
    other = {};
  delete params.cast;

  update["url"] = params.url ? params.url : helpers.viSeo(params.name.vn);
  img["poster"] = update["url"]+'.jpg';
  params.img.slide ? (img["slide"] = params.img.slide) : null;
  update["img"] = img;

  name["vn"] = helpers.content(params.name.vn);
  name["en"] = helpers.content(params.name.en);
  update["name"] = name;

  status["s"] = params.status.s;
  status["q"] = params.status.q;
  status["r"] = params.status.r;
  status["l"] = params.status.l;
  update["status"] = status;

  update["dir"] = params.dir;

  c_c["ca"] = params.c_c.ca;
  c_c["co"] = params.c_c.co;
  update["c_c"] = c_c;

  content["text"] = helpers.content(params.content.text);
  params.content.l_f ? (content["l_f"] = params.content.l_f) : null;
  params.content.img ? (content["img"] = params.content.img) : null;
  params.content.video ? (content["video"] = params.content.video) : null;
  content["s_t"] = params.content.s_t
    ? params.content.s_t
    : helpers.keyTag(`${params.name.vn}, ${params.name.en}`);
  update["content"] = content;

  params.t_l.t_r ? (t_l["t_r"] = parseInt(params.t_l.t_r)) : null;
  params.t_l.t_s ? (t_l["t_s"] = parseInt(params.t_l.t_s)) : null;
  t_l["t_f"] = parseInt(params.t_l.t_f);
  update["t_l"] = t_l;

  other["p_at"] = new Date();
  other["view"] = 1;
  params.other.d ? (other["d"] = params.other.d) : null;
  params.other.t_film ? (other["t_film"] = params.other.t_film) : null;
  params.other.t_ep ? (other["t_ep"] = params.other.t_ep) : null;
  params.other.nsx ? (other["nsx"] = params.other.nsx) : null;
  params.other.year ? (other["year"] = parseInt(params.other.year)) : null;
  update["other"] = other;

  let dbo = db.db(process.env.DB_SV_1);
  return dbo.collection(process.env.CL_INFO_MOVIE).insertOne(update);
}
//  * ADD MOVIE TO CAST * //
function addMovie2Cast(db_4, id, cast) {
  if (!db_4 || !id || !cast) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo_4 = db_4.db(process.env.DB_SV_4);
  cast.split(", ").forEach((element) => {
    dbo_4
      .collection(process.env.CL_CAST)
      .updateMany(
        { name: element },
        { $addToSet: { movie: { $each: [ObjectID(id).toString()] } } },
        { upsert: true }
      );
  });
}
// function addFilm(db, params) {
//     if(params){
//         let update = {}, img = {}, name = {}, status = {}, d_s = {}, c_c = {}, content = {}, t_l = {}, other = {};

//         update['url'] = params.url_phim ? params.url_phim: helpers.viSeo(params.ten_phim_vn);

//         img['poster'] = params.poster_phim;
//         params.anh_slide_phim ? img['slide'] = params.anh_slide_phim : img = img;
//         update['img'] = img;

//         name['vn'] = helpers.content(params.ten_phim_vn);
//         name['en'] = helpers.content(params.ten_phim_en);
//         update['name'] = name;

//         status['s'] = params.trang_thai_phim;
//         status['q'] = params.cl_phim;
//         status['r'] = params.q_phim;
//         status['l'] = params.nn_phim;
//         update['status'] = status;

//         d_s['directors'] = params.dao_dien_phim;
//         d_s['cast'] = params.dien_vien_phim;
//         update['d_s'] = d_s;

//         c_c['ca'] = params.category;
//         c_c['co'] = params.contruy;
//         update['c_c'] = c_c;

//         content['text'] = helpers.content(params.noi_dung_phim);
//         params.lich_phim ? content['l_f'] = params.lich_phim : content = content;
//         params.anh_ngang_phim ? content['img'] = params.anh_ngang_phim : content = content;
//         params.url_trailer ? content['video'] = params.url_trailer : content = content;
//         content['s_t'] = params.tu_khoa_phim ? params.tu_khoa_phim : helpers.keyTag(params.ten_phim_vn+', '+params.ten_phim_en);
//         update['content'] = content;

//         params.bq_phim == 1 ? t_l['t_r'] = 1 : t_l = t_l;
//         params.sl_phim == 0 ? t_l['t_s'] = 0 : t_l = t_l;
//         t_l['t_f'] = parseInt(params.loai_phim);
//         update['t_l'] = t_l;

//         other['p_at'] = new Date();
//         other['view'] = 1;
//         params.ngay_phat_phim ?  other['d'] = params.ngay_phat_phim : other = other;
//         params.thoi_luong_phim ? other['t_film'] = params.thoi_luong_phim : other = other;
//         params.so_tap_phim ? other['t_ep'] = params.so_tap_phim : other = other;
//         params.nha_sx_phim ? other['nsx'] = params.nha_sx_phim : other = other;
//         params.nam_phim ? other['year'] = parseInt(params.nam_phim) : other = other;
//         update['other'] = other;

//         let dbo = db.db(process.env.DB_SV_1);
//         return dbo.collection(process.env.CL_INFO_MOVIE).insertOne(update);
//     }
//     return false;
// }
// * EDIT - UPDATE MOVIE * //
// function editFilm(db, params) {
//     if(params){

//         let update = {}, img = {}, name = {}, status = {}, d_s = {}, c_c = {}, content = {}, t_l = {}, other = {};

//         update['url'] = params.url_phim ? params.url_phim: helpers.viSeo(params.ten_phim_vn);

//         img['poster'] = params.poster_phim;
//         params.anh_slide_phim ? img['slide'] = params.anh_slide_phim : img = img;
//         update['img'] = img;

//         name['vn'] = helpers.content(params.ten_phim_vn);
//         name['en'] = helpers.content(params.ten_phim_en);
//         update['name'] = name;

//         status['s'] = params.trang_thai_phim;
//         status['q'] = params.cl_phim;
//         status['r'] = params.q_phim;
//         status['l'] = params.nn_phim;
//         update['status'] = status;

//         d_s['directors'] = params.dao_dien_phim;
//         d_s['cast'] = params.dien_vien_phim;
//         update['d_s'] = d_s;

//         c_c['ca'] = params.category;
//         c_c['co'] = params.contruy;
//         update['c_c'] = c_c;

//         content['text'] = helpers.content(params.noi_dung_phim);
//         params.lich_phim ? content['l_f'] = params.lich_phim : content = content;
//         params.anh_ngang_phim ? content['img'] = params.anh_ngang_phim : content = content;
//         params.url_trailer ? content['video'] = params.url_trailer : content = content;
//         content['s_t'] = params.tu_khoa_phim ? params.tu_khoa_phim : helpers.keyTag(params.ten_phim_vn+', '+params.ten_phim_en);
//         update['content'] = content;

//         params.bq_phim == 1 ? t_l['t_r'] = 1 : t_l = t_l;
//         params.sl_phim == 0 ? t_l['t_s'] = 0 : t_l = t_l;
//         t_l['t_f'] = parseInt(params.loai_phim);
//         update['t_l'] = t_l;

//         other['p_at'] = new Date();
//         other['view'] = parseInt(params.view) || 0;
//         params.ngay_phat_phim ?  other['d'] = params.ngay_phat_phim : other = other;
//         params.thoi_luong_phim ? other['t_film'] = params.thoi_luong_phim : other = other;
//         params.so_tap_phim ? other['t_ep'] = params.so_tap_phim : other = other;
//         params.nha_sx_phim ? other['nsx'] = params.nha_sx_phim : other = other;
//         params.nam_phim ? other['year'] = parseInt(params.nam_phim) : other = other;
//         update['other'] = other;

//         let dbo = db.db(process.env.DB_SV_1);
//         return dbo.collection(process.env.CL_INFO_MOVIE).updateOne({ "_id" : ObjectID(params.id) }, { $set: update });
//     }
//     return false;
// }

// * EDIT - UPDATE MOVIE * //
function editFilm(db, db_4, params) {
  if (!db || !db_4 || !params) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  // Create update cast
  const dbo_4 = db_4.db(process.env.DB_SV_4);
  if (params.cast_add) {
    dbo_4
      .collection(process.env.CL_CAST)
      .updateMany(
        { name: { $in: params.cast_add } },
        { $addToSet: { movie: { $each: [params._id] } } },
        { upsert: true }
      );
  }
  if (params.cast_del) {
    dbo_4
      .collection(process.env.CL_CAST)
      .updateMany(
        { name: { $in: params.cast_del } },
        { $pull: { movie: params._id } },
        { upsert: true }
      );
  }
  // Create array info
  let update = {},
    img = {},
    name = {},
    status = {},
    c_c = {},
    content = {},
    t_l = {},
    other = {};

  delete params.cast_add;
  delete params.cast_del;

  update["url"] = params.url ? params.url : helpers.viSeo(params.name.vn);
  img["poster"] = params.img.poster;
  params.img.slide ? (img["slide"] = params.img.slide) : null;
  update["img"] = img;

  name["vn"] = helpers.content(params.name.vn);
  name["en"] = helpers.content(params.name.en);
  update["name"] = name;

  status["s"] = params.status.s;
  status["q"] = params.status.q;
  status["r"] = params.status.r;
  status["l"] = params.status.l;
  update["status"] = status;

  update["dir"] = params.dir;

  c_c["ca"] = params.c_c.ca;
  c_c["co"] = params.c_c.co;
  update["c_c"] = c_c;

  content["text"] = helpers.content(params.content.text);
  params.content.l_f ? (content["l_f"] = params.content.l_f) : null;
  params.content.img ? (content["img"] = params.content.img) : null;
  params.content.video ? (content["video"] = params.content.video) : null;
  content["s_t"] = params.content.s_t
    ? params.content.s_t
    : helpers.keyTag(`${params.name.vn}, ${params.name.en}`);
  update["content"] = content;

  params.t_l.t_r ? (t_l["t_r"] = parseInt(params.t_l.t_r)) : null;
  params.t_l.t_s ? (t_l["t_s"] = parseInt(params.t_l.t_s)) : null;
  t_l["t_f"] = parseInt(params.t_l.t_f);
  update["t_l"] = t_l;

  other["p_at"] = new Date();
  other["view"] = parseInt(params.other.view) || 1;
  params.other.d ? (other["d"] = params.other.d) : null;
  params.other.t_film ? (other["t_film"] = params.other.t_film) : null;
  params.other.t_ep ? (other["t_ep"] = params.other.t_ep) : null;
  params.other.nsx ? (other["nsx"] = params.other.nsx) : null;
  params.other.year ? (other["year"] = parseInt(params.other.year)) : null;
  update["other"] = other;

  const dbo = db.db(process.env.DB_SV_1);
  return dbo
    .collection(process.env.CL_INFO_MOVIE)
    .updateOne({ _id: ObjectID(params._id) }, { $set: update });
}

// * DELETE MOVIE * //
function delMovie(db, id) {
  if (id) {
    let dbo = db.db(process.env.DB_SV_1);
    return dbo
      .collection(process.env.CL_INFO_MOVIE)
      .deleteOne({ _id: ObjectID(id) });
  }
  return false;
}
// * DELETE MOVIES * //
function delMovies(db, arrayID) {
  if (!db || !arrayID) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const arrayObjectID = [];
  JSON.parse(arrayID).forEach((id) => {
    arrayObjectID.push(new ObjectID(id));
  });
  const dbo = db.db(process.env.DB_SV_1);
  return dbo
    .collection(process.env.CL_INFO_MOVIE)
    .deleteMany({ _id: { $in: arrayObjectID } });
}
// * ADVANCE MOVIES * //
function advanceMovie(db, type, arrayID) {
  if (!db || !type || !arrayID) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const arrayObjectID = [];
  JSON.parse(arrayID).forEach((id) => {
    arrayObjectID.push(new ObjectID(id));
  });
  const dbo = db.db(process.env.DB_SV_1);
  switch (type) {
    case "hinden-movie":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $set: { "t_l.t_so": 1 } }
        );
    case "del-hinden":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $unset: { "t_l.t_so": 1 } }
        );
    case "add-movie-sl":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $set: { "t_l.t_s": 1 } }
        );
    case "del-movie-sl":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $unset: { "t_l.t_s": 1 } }
        );
    case "add-movie-cr":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $set: { "t_l.t_r": 1 } }
        );
    case "del-movie-cr":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $unset: { "t_l.t_r": 1 } }
        );
    case "pin-movie":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $set: { "t_l.t_p": 1 } }
        );
    case "unpin-movie":
      return dbo
        .collection(process.env.CL_INFO_MOVIE)
        .updateMany(
          { _id: { $in: arrayObjectID } },
          { $unset: { "t_l.t_p": 1 } }
        );
    default:
      return new Promise((resolve, reject) => {
        reject({ code: 0 });
      });
  }
}

// FUNCTION EPISODE //
// * FUNCTION CREATE || ADD || UPDATE || DELETE EPISODE * //
function CURDEpisode(db, params) {
  if (!db || !params) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_3);
  return dbo
    .collection(process.env.CL_EPISODE)
    .updateOne(
      { _id: ObjectID(params.id) },
      { $set: { l: JSON.parse(params.episode) } },
      { upsert: true }
    );

  // if (params) {
  //     let defer = q.defer();
  //     let dbo = db.db(process.env.DB_SV_3), data = params.listEp.replace(/[\s]/gi, '').split('/view'), episode = [];
  //     dbo.collection(process.env.CL_EPISODE).findOne({ "_id" : ObjectID(params.id) }, (err, result) => {
  //         if (err) {defer.reject();}
  //         result ? episode = result.l : episode;
  //         for (let i = 0; i < (data.length - 1); i++) {
  //             vyv = data[i].split('|');
  //             episode.push({t: vyv[0], d: helpers.getIDDrive(vyv[1])});
  //         };
  //         defer.resolve(dbo.collection(process.env.CL_EPISODE).updateOne( { "_id" : ObjectID(params.id) }, { $set: { l: episode } }, { upsert: true } ));
  //     });
  //     return defer.promise;
  // }
  // return false;
}

// * FUNCTION CREATE OR ADD EPISODE MULTIPLE EP * //
function addEpisode(db, params) {
  if (params) {
    return new Promise((resolve, reject) => {
      let dbo = db.db(process.env.DB_SV_3),
        data = params.listEp.replace(/[\s]/gi, "").split("/view"),
        episode = [];
      dbo
        .collection(process.env.CL_EPISODE)
        .findOne({ _id: ObjectID(params.id) }, (err, result) => {
          if (err) {
            reject();
          }
          result ? (episode = result.l) : episode;
          for (let i = 0; i < data.length - 1; i++) {
            const vyv = data[i].split("|");
            episode.push({ t: vyv[0], d: helpers.getIDDrive(vyv[1]) });
          }
          resolve(
            dbo
              .collection(process.env.CL_EPISODE)
              .updateOne(
                { _id: ObjectID(params.id) },
                { $set: { l: episode } },
                { upsert: true }
              )
          );
        });
    });
  }
  return false;
}

// * FUNCTION CREATE OR ADD EPISODE * //
function addEpisodeOne(db, params) {
  if (params) {
    let episode = {};
    episode["t"] = params.name;
    params.drive ? (episode["d"] = helpers.getIDDrive(params.drive)) : episode;
    params.photo ? (episode["p"] = helpers.trimStr(params.photo)) : episode;
    params.embed ? (episode["e"] = helpers.trimStr(params.embed)) : episode;
    let dbo = db.db(process.env.DB_SV_3);
    return dbo
      .collection(process.env.CL_EPISODE)
      .updateOne(
        { _id: ObjectID(params.id) },
        { $push: { l: episode } },
        { upsert: true }
      );
  }
  return false;
}

// * FUNCTION UPDATE EPISODE ONE* //
function editEpOne(db, params) {
  if (params) {
    let episode = {},
      dbo = db.db(process.env.DB_SV_3),
      update = {};
    episode["t"] = params.name;
    params.drive ? (episode["d"] = helpers.getIDDrive(params.drive)) : episode;
    params.photo ? (episode["p"] = helpers.trimStr(params.photo)) : episode;
    params.embed ? (episode["e"] = helpers.trimStr(params.embed)) : episode;
    update["l." + params.value] = episode;
    return dbo
      .collection(process.env.CL_EPISODE)
      .updateOne(
        { _id: ObjectID(params.id) },
        { $set: update },
        { upsert: true }
      );
  }
  return false;
}

// * FUNCTION DELETE EPISODE * //
function delEpOne(db, params) {
  if (params) {
    let episode = {},
      dbo = db.db(process.env.DB_SV_3);
    episode["t"] = params.name;
    params.drive ? (episode["d"] = helpers.getIDDrive(params.drive)) : episode;
    params.photo ? (episode["p"] = helpers.trimStr(params.photo)) : episode;
    params.embed ? (episode["e"] = helpers.trimStr(params.embed)) : episode;
    return dbo
      .collection(process.env.CL_EPISODE)
      .updateOne(
        { _id: ObjectID(params.id) },
        { $pull: { l: episode } },
        { upsert: true }
      );
  }
  return false;
}

// * DELETE ALL EPISODE OF MOVIE * //
function delAllEpisode(db, id) {
  if (!db || !id) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_3);
  return dbo
    .collection(process.env.CL_EPISODE)
    .deleteOne({ _id: ObjectID(id) });
}

// * GET INFO EPISODE * //
function getListEp(db, id, projection) {
  if (!db || !id) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  projection = eval("({" + projection + "})");
  const dbo = db.db(process.env.DB_SV_3);
  return dbo.collection(process.env.CL_EPISODE).findOne({ "_id" : ObjectID(id) }, { projection: projection });
}


// function getListMovie(db, query, projection, limit, skip){
//     const dbo = db.db(process.env.DB_SV_1);
//     query = eval('({' + query + '})');
//     projection = eval('({' + projection + '})');
//     return dbo.collection(process.env.CL_INFO_MOVIE).find( query, {projection: projection} ).sort({'other.p_at': -1}).limit(limit).skip(skip).toArray();
// }


// * GET SERVER STATUS */ /
function serverStatus(db, dbName) {
  if (!db || !dbName) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  switch (dbName) {
    case 1:
      const dbo_1 = db.db(process.env.DB_SV_1);
      return dbo_1.admin().serverStatus();
    case 2:
      const dbo_2 = db.db(process.env.DB_SV_2);
      return dbo_2.admin().serverStatus();
    case 3:
      const dbo_3 = db.db(process.env.CL_EPISODE);
      return dbo_3.admin().serverStatus();
    case 4:
      const dbo_4 = db.db(process.env.DB_SV_4);
      return dbo_4.admin().serverStatus();
    default:
      return new Promise((resolve, reject) => {
        reject({ code: 0 });
      });
  }
}

module.exports = {
  addFilm: addFilm,
  addMovie2Cast,
  getInfoFilm: getInfoFilm,
  editFilm: editFilm,
  delMovie: delMovie,
  delMovies: delMovies,
  advanceMovie,
  CURDEpisode,
  addEpisode: addEpisode,
  addEpisodeOne: addEpisodeOne,
  getListEp: getListEp,
  editEpOne: editEpOne,
  delEpOne: delEpOne,
  delAllEpisode: delAllEpisode,
  count: count,
  serverStatus: serverStatus,
  countMovie,
};

// let update = {}, img = {}, name = {}, status = {}, d_s = {}, c_c = {}, content = {}, t_l = {}, other = {};

//         update['url'] = null;

//         img['poster'] = null;
//         img['slide'] = null;
//         update['img'] = img;

//         name['vn'] = null;
//         name['en'] = null;
//         update['name'] = name;

//         status['s'] = null;
//         status['q'] = null;
//         status['r'] = null;
//         status['l'] = null;
//         update['status'] = status;

//         d_s['directors'] = null;
//         d_s['cast'] = null;
//         update['d_s'] = d_s;

//         c_c['ca'] = [];
//         c_c['co'] = [];
//         update['c_c'] = c_c;

//         content['text'] = null;
//         content['l_f'] = null;
//         content['img'] = null;
//         content['video'] = null;
//         content['s_t'] = null;
//         update['content'] = content;

//         t_l['t_r'] = 0;
//         t_l['t_s'] = 0;
//         t_l['t_f'] = null;
//         update['t_l'] = t_l;

//         other['view'] = 0;
//         other['d'] = null;
//         other['t_film'] =  null
//         other['t_ep'] = null;
//         other['nsx'] = null;
//         other['year'] = null;
//         update['other'] = other;
