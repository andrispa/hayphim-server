const request = require('request').defaults({ encoding: null });

function uploadImg2Gitlab(url, name) {
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            request.post({
                uri: `https://gitlab.com/api/v4/projects/${ process.env.GITLAB_IDPROJECT_IMG }/repository/files/${ name }.jpg`,
                form:{
                    content: Buffer.from(body).toString('base64'),
                    encoding: 'base64',
                    branch: 'main',
                    commit_message: new Date().toLocaleString(),
                    author_email: 'dangvinhprovn@gmail.com',
                    author_name: 'meo coder'
                },
                headers: {
                    'PRIVATE-TOKEN': process.env.GITLAB_TOKEN,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36'
                },
                gzip: true
            })
        }
    })
}



module.exports = {
    uploadImg2Gitlab
}