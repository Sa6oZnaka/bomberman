var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3EfeP';

module.exports = function (app, passport, connection, serverRooms) {

    app.get('/login', function (req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.use(function (req, res, next) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }), function (req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }
        res.redirect('/');
    });

    app.get('/register', function (req, res) {
        res.render('register.ejs', {
            message: req.flash('registerMessage')
        });
    });

    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));

    app.get('/', isLoggedIn, function (req, res) {
        res.render('index.ejs', null);
    });

    app.get('/getUser', isLoggedIn, function (req, res) {
        res.send(JSON.stringify({
            user: req.user.username,
            level: req.user.level_points,
            rank: req.user.rank_points,
            wins: req.user.wins,
        }));
        serverRooms.addOnlineUser(req.cookies.io, req.user.username);
    });

    app.get('/getUserReplays', isLoggedIn, function (req, res) {
        let sql =
            `SELECT f.* 
            FROM User_replay pf
            INNER JOIN Replay f
            ON f.id = pf.replay_id AND pf.user_id = ?`;
        connection.query(sql, [req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
            res.send(JSON.stringify(result));
        });
    });

    app.get('/getLeaderBoard', isLoggedIn, function (req, res) {
        let sql =
            `SELECT username, rank_points FROM User
            ORDER BY rank_points DESC
            LIMIT 10;`;
        connection.query(sql, function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
            res.send(JSON.stringify(result));
        });
    });

    app.get('/getFriends', isLoggedIn, function (req, res) {
        let sql = `SELECT u.username, rl.status 
                  FROM User_relation rl
                  INNER JOIN User u
                  ON rl.status = 'F' AND (rl.sender_id = ? AND u.id = rl.receiver_id) OR (rl.receiver_id = ? AND u.id = rl.sender_id)
                  ORDER BY status DESC`;
        connection.query(sql, [req.user.id, req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
            res.send(JSON.stringify(result));
        });
    });

    app.post('/addFriend', isLoggedIn, function (req, res) {
        let friendName = JSON.parse(req.body.data);
        if (friendName == req.user.username) return; // User can't add self
        let sql = `INSERT INTO User_relation(sender_id, receiver_id) 
                    SELECT ?, u.id
                    FROM User u where u.username = ? AND 
                    NOT EXISTS(SELECT * FROM  User_relation ur 
                    WHERE ur.sender_id = u.id AND ur.receiver_id = ?);`;
        connection.query(sql, [req.user.id, friendName, req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    });

    app.post('/acceptFriend', isLoggedIn, function (req, res) {
        let sql = `UPDATE User_relation LEFT JOIN User u on u.username = ? 
                    SET status='F' WHERE sender_id = u.id AND receiver_id = ?;`;
        connection.query(sql, [JSON.parse(req.body.data), req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    });

    app.post('/blockUser', isLoggedIn, function (req, res) {
        let sql = `UPDATE User_relation LEFT JOIN User u on u.username = ? 
                    SET status='B' 
                    WHERE (sender_id = u.id AND receiver_id = ?) 
                    OR    (sender_id = ? AND receiver_id = u.id);`;
        connection.query(sql, [JSON.parse(req.body.data), req.user.id , req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    });

    app.post('/removeFriend', isLoggedIn, function (req, res) {
        let sql = 'delete from User_relation \n' +
            'where (sender_id = (select id from User u where u.username = ?) AND receiver_id = ?)\n' +
            'OR (receiver_id = (select id from User u where u.username = ?) AND sender_id = ?)';
        connection.query(sql, [JSON.parse(req.body.data), req.user.id, JSON.parse(req.body.data), req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    });

    app.post('/sendMessage', isLoggedIn, function (req, res) {
        let data = JSON.parse(req.body.data);
        let sql = `INSERT INTO Message(sender_id, receiver_id, message) 
                    SELECT ?, u.id, ?
                    FROM User u where u.username = ?;`;
        connection.query(sql, [req.user.id, encrypt(data.message), data.username, req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
        });
    });

    app.get('/getMessages', isLoggedIn, function (req, res) {
        let sql = `SELECT m.*
                    FROM Message m
                    INNER JOIN User u ON 
                    u.username = ? AND (m.sender_id = u.id AND m.receiver_id = ?) OR  
                    u.username = ? AND (m.sender_id = ? AND m.receiver_id = u.id);`;
        connection.query(sql, [req.query.name, req.user.id, req.query.name, req.user.id], function (error, result) {
            if (error) return console.error("\x1b[33m" + error.message + "\x1b[0m");
            for(let i = 0; i < result.length; i ++){
                result[i].message = decrypt(result[i].message);
            }
            return res.send(JSON.stringify(result));
        });
    });

    app.get('/logout', function (req, res) {
        req.session.destroy(function (err) {
            res.redirect('/login');
        });
    });

    function encrypt(text){
        let cipher = crypto.createCipher(algorithm,password);
        let crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    function decrypt(text){
        let decipher = crypto.createDecipher(algorithm,password);
        let dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}