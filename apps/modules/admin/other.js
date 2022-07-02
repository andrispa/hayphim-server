const ObjectID = require("mongodb").ObjectID;
const JWT = require('../../helpers/jwt.helper');

// Thêm sửa xóa cập nhật thể loại //
function getListCategory(db, locale) {
  if (!db || !locale) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo
    .collection(process.env.CL_CUSTOM)
    .findOne({ _id: "data_"+locale }, { projection: { category: 1 } });
}
function CURDCategory(db, params, locale) {
  if (!db || !params || !locale) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo
    .collection(process.env.CL_CUSTOM)
    .updateOne(
      { _id: "data_"+locale },
      { $set: { category: JSON.parse(params) } },
      { upsert: true }
    );
}

// Thêm sửa xóa cập nhật quốc gia //
function getListCountry(db, locale) {
  if (!db || !locale) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo
    .collection(process.env.CL_CUSTOM)
    .findOne({ _id: "data_"+locale }, { projection: { country: 1 } });
}
function CURDCountry(db, params, locale) {
  if (!db || !params || !locale) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo
    .collection(process.env.CL_CUSTOM)
    .updateOne(
      { _id: "data_"+locale },
      { $set: { country: JSON.parse(params) } },
      { upsert: true }
    );
}

// **  Thông tin trang web ** //

// Lấy thông tin tùy chỉnh //
function getCustom(db, type, locale) {
  if (!db || !type || !locale) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  switch (type) {
    case "basic":
      return dbo
        .collection(process.env.CL_CUSTOM)
        .findOne({ _id: "data_"+locale }, { projection: { basic: 1 } });
    case "advance":
      return dbo
        .collection(process.env.CL_CUSTOM)
        .findOne({ _id: "data_"+locale }, { projection: { advance: 1 } });
    default:
      return new Promise((resolve, reject) => {
        reject({ code: 0 });
      });
  }
}
// Thêm sửa xóa cập nhật tùy chỉnh thông tin trang web //
function CURDCustom(db, type, params, locale) {
  if (!db || !type || !params || !locale) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  switch (type) {
    case "basic":
      return dbo
        .collection(process.env.CL_CUSTOM)
        .updateOne(
          { _id: "data_"+locale },
          { $set: { basic: params } },
          { upsert: true }
        );
    case "advance":
      return dbo
        .collection(process.env.CL_CUSTOM)
        .updateOne(
          { _id: "data_"+locale },
          { $set: { advance: params } },
          { upsert: true }
        );
    default:
      return new Promise((resolve, reject) => {
        reject({ code: 0 });
      });
  }
}

// **  Thêm sửa xóa cập nhật diễn viên ** //

// * Lấy danh sách diễn viên * //
function getListCast(db, limit, skip) {
  if (!db || !limit || !skip) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo
    .collection(process.env.CL_CAST)
    .find({}, { projection: { name: 1, country: 1 } })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .toArray();
}
// * Thêm diễn viên * //
function addCast(db, params) {
  if (!db || !params) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const data = {};
  params.name ? (data["name"] = params.name) : "Chưa rõ";
  params.name_other ? (data["name_other"] = params.name_other) : null;
  params.birthday ? (data["birthday"] = params.birthday) : null;
  params.village ? (data["village"] = params.village) : null;
  params.height ? (data["height"] = params.height) : null;
  params.manage ? (data["manage"] = params.manage) : null;
  params.debut ? (data["debut"] = params.debut) : null;
  params.img ? (data["img"] = params.img) : null;
  params.hot ? (data["hot"] = params.hot) : null;
  params.description ? (data["description"] = params.description) : null;
  params.school ? (data["school"] = params.school) : null;
  params.country ? (data["country"] = params.country) : null;
  const dbo = db.db(process.env.DB_SV_4);
  dbo
    .collection(process.env.CL_CAST)
    .createIndex({ name: 1 }, { unique: true });
  return dbo.collection(process.env.CL_CAST).insertOne(data);
}
// * Lấy thông tin diễn viên * //
function getInfoCast(db, id) {
  if (!db || !id) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo.collection(process.env.CL_CAST).findOne({ _id: ObjectID(id) });
}
// * Chỉnh sửa diễn viên * //
function editCast(db, params) {
  if (!db || !params || !params._id) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const data = {};
  params.name ? (data["name"] = params.name) : "Chưa rõ";
  params.name_other ? (data["name_other"] = params.name_other) : null;
  params.birthday ? (data["birthday"] = params.birthday) : null;
  params.village ? (data["village"] = params.village) : null;
  params.height ? (data["height"] = params.height) : null;
  params.manage ? (data["manage"] = params.manage) : null;
  params.debut ? (data["debut"] = params.debut) : null;
  params.img ? (data["img"] = params.img) : null;
  params.hot ? (data["hot"] = params.hot) : null;
  params.description ? (data["description"] = params.description) : null;
  params.school ? (data["school"] = params.school) : null;
  params.country ? (data["country"] = params.country) : null;
  const dbo = db.db(process.env.DB_SV_4);
  dbo
    .collection(process.env.CL_CAST)
    .createIndex({ name: 1 }, { unique: true });
  return dbo
    .collection(process.env.CL_CAST)
    .updateOne({ _id: ObjectID(params._id) }, { $set: data });
}
// * Xóa một diễn viên * //
function deleteCast(db, id) {
  if (!db || !id) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_4);
  return dbo.collection(process.env.CL_CAST).deleteOne({ _id: ObjectID(id) });
}
// * Xóa nhiều diễn viên * //
function deleteCasts(db, arrayID) {
  if (!db || !arrayID) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const arrayObjectID = [];
  JSON.parse(arrayID).forEach((id) => {
    arrayObjectID.push(new ObjectID(id));
  });
  let dbo = db.db(process.env.DB_SV_4);
  return dbo
    .collection(process.env.CL_CAST)
    .deleteMany({ _id: { $in: arrayObjectID } });
}


// Thêm sửa xóa cập nhật thành viên //
function getListUser(db, limit, skip) {
  if (!db || !limit || !skip) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_2);
  return dbo
    .collection(process.env.CL_USERS)
    .find({}, { projection: { name: 1, email: 1, type: 1, ban: 1, avatar: 1 } })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .toArray();
}
function CURDUser(db, type, arrayID) {
  if (!db || !type || !arrayID) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const arrayObjectID = [];
  JSON.parse(arrayID).forEach((id) => {
    arrayObjectID.push(new ObjectID(id));
  });
  const dbo = db.db(process.env.DB_SV_2);
  switch (type) {
    case "ban":
      return dbo
        .collection(process.env.CL_USERS)
        .updateMany({ _id: { $in: arrayObjectID } }, { $set: { ban: 1 } });
    case "unban":
      return dbo
        .collection(process.env.CL_USERS)
        .updateMany({ _id: { $in: arrayObjectID } }, { $unset: { ban: 1 } });
    case "delete":
      return dbo
        .collection(process.env.CL_USERS)
        .deleteMany({ _id: { $in: arrayObjectID } });
    default:
      return new Promise((resolve, reject) => {
        reject({ code: 0 });
      });
  }
}

// Thêm sửa xoá cập nhật báo lỗi/phản hồi//
function getListReport(db, limit, skip) {
  if (!db || !limit || !skip) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const dbo = db.db(process.env.DB_SV_2);
  return dbo
    .collection(process.env.CL_REPORT_EPISODE_ERROR)
    .find({}, { projection: {} })
    .sort({ m_t: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .toArray();
}

// * Xóa nhiều phản hồi * //
function CURDReport(db, type, arrayID) {
  if (!db || !type || !arrayID) {
    return new Promise((resolve, reject) => {
      reject({ code: 0 });
    });
  }
  const arrayObjectID = [];
  JSON.parse(arrayID).forEach((id) => {
    arrayObjectID.push(new ObjectID(id));
  });
  let dbo = db.db(process.env.DB_SV_2);
  switch (type) {
    case "deleteReports":
      return dbo
        .collection(process.env.CL_REPORT_EPISODE_ERROR)
        .deleteMany({ _id: { $in: arrayObjectID } });
    // case "unban":
    //   return dbo
    //     .collection(process.env.CL_USERS)
    //     .updateMany({ _id: { $in: arrayObjectID } }, { $unset: { ban: 1 } });
    default:
      return new Promise((resolve, reject) => {
        reject({ code: 0 });
      });
  }
}

// Thêm bình luận
async function addComment(db, params, token) {
    if (!db || !params.content || !params.id_m && !params.id_commnent || !params.mode || !token) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    let { data } = await JWT.verifyToken(token.split('Bearer ')[1], process.env.SECURITY_JWT);
    const dataComment = {};
    const dbo = db.db(process.env.DB_SV_5);
    switch (params.mode) {
        case 'comment':
            try {
                data === 'admin' ? data = {id: '3101999', name: 'admin', isAdmin: true} : null;
                ObjectID.isValid(params.id_m) ? null : mecoder -1;
                dataComment['content'] = params.content;
                dataComment['id_m'] = params.id_m;
                dataComment['time'] = new Date();
                // dataComment['u_name'] = data.name,
                // data.type === 'fb' ? dataComment['u_img'] = data.id : null;
                data.isAdmin ? dataComment['isAdmin'] = true : null;
                dataComment['id_u'] = data.id;
                return dbo.collection(process.env.CL_COMMENT).insertOne(dataComment);
            } catch (error) {
                return new Promise((resolve, reject) => {
                    reject({ code: error })
                });
            }
        case 'reply':
            try {
                data === 'admin' ? data = {id: '3101999', name: 'admin', isAdmin: true} : null;
                ObjectID.isValid(params.id_commnent) ? null : mecoder -1;
                params.repliesUser ? dataComment['p_name'] = params.repliesUser : null;
                dataComment['content'] = params.content;
                dataComment['id_parent'] = params.id_commnent;
                dataComment['time'] = new Date();
                // dataComment['u_name'] = data.name,
                // data.type === 'fb' ? dataComment['u_img'] = data.id : null;
                data.isAdmin ? dataComment['isAdmin'] = true : null;
                dataComment['id_u'] = data.id;
                await dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(params.id_commnent) }, { $inc: { "nComment": parseInt(1) } } );
                return dbo.collection(process.env.CL_COMMENT).insertOne(dataComment);
            } catch (error) {
                return new Promise((resolve, reject) => {
                    reject({ code: error })
                });
            }
        default:
            return new Promise((resolve, reject) => {
                reject({ code: 1 })
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
// Lấy danh sách thông tin người dùng
function getListInfoUser(db, arrayID) {
    if (!db || !arrayID) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    const dbo = db.db(process.env.DB_SV_2);
    return dbo.collection(process.env.CL_USERS).find( { $or: [ { _id: { $in: arrayID.map(id => ObjectID.isValid(id) ? ObjectID(id) : null) } }, { id: { $in: arrayID } } ] }, { projection: { _id: 1, name: 1, avatar: 1 } } ).toArray();
}
// Curd bình luận
async function curdComment(db, id, idParent, mode, token) {
    if (!db || !id || !ObjectID.isValid(id) || !mode || !token) {
        return new Promise((resolve, reject) => {
            reject({ code: 0 })
        });
    }
    const dbo = db.db(process.env.DB_SV_5);
    let { data } = await JWT.verifyToken(token.split('Bearer ')[1], process.env.SECURITY_JWT);
    try {
        data === 'admin' ? data = {id: '3101999'} : null;
        switch (mode) {
            case 'del':
                await dbo.collection(process.env.CL_COMMENT).deleteMany( { id_parent: id } );
                return dbo.collection(process.env.CL_COMMENT).deleteOne( { _id: ObjectID(id) } );
            case 'del-reply':
                await dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(idParent) }, { $inc: { "nComment": parseInt(-1) } } );
                return dbo.collection(process.env.CL_COMMENT).deleteOne( { _id: ObjectID(id) } );
            case 'like':
                return dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(id) }, { $addToSet: { like: { $each: [ data._id || data.id ] } } } );
            case 'pin':
                return dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(id) }, { $set: { isPin: true } } );
            case 'unpin':
                return dbo.collection(process.env.CL_COMMENT).updateOne( { _id: ObjectID(id) }, { $unset: { isPin: true } } );
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
// Lấy danh sách phim
function getFilmHome(db, query, projection, sort, limit, skip){
    const dbo = db.db(process.env.DB_SV_1);
    query = eval('({' + query + '})');
    projection = eval('({' + projection + '})');
    sort = eval('({' + sort + '})');
    return dbo.collection(process.env.CL_INFO_MOVIE).find( query, {projection: projection} ).sort(sort).limit(limit).skip(skip).toArray();
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
  CURDUser,
  getListReport,
  CURDReport,
  addComment,
  getListComment,
  getListInfoUser,
  curdComment,
  searchCast,
  getFilmHome
};
