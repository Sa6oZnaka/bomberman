let LocalStrategy = require("passport-local").Strategy;

let mysql = require('mysql');
let bcrypt = require('bcrypt-nodejs');
let dbconfig = require('../../config/dbconfig');
let connection = mysql.createConnection(dbconfig);

connection.query('USE ' + dbconfig.database);

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ", [id],
            function (err, rows) {
                done(err, rows[0]);
            });
    });

    passport.use(
        'local-register',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {
                connection.query("SELECT * FROM users WHERE username = ? ",
                    [username], function (err, rows) {
                        if (err)
                            return done(err);
                        if (rows.length) {
                            return done(null, false, req.flash('registerMessage', 'That is already taken'));
                        } else {
                            let newUserMysql = {
                                username: username,
                                password: bcrypt.hashSync(password, null, null)
                            };

                            let insertQuery = "INSERT INTO users (username, password) values (?, ?)";

                            connection.query(insertQuery, [newUserMysql.username, newUserMysql.password],
                                function (err, rows) {
                                    console.log(err);
                                    console.log(rows.insertId);
                                    newUserMysql.id = rows.insertId;

                                    return done(null, newUserMysql);
                                });
                        }
                    });
            })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {
                connection.query("SELECT * FROM users WHERE username = ? ", [username],
                    function (err, rows) {
                        if (err)
                            return done(err);

                        if (!rows.length) {
                            return done(null, false, req.flash('loginMessage', 'No User Found'));
                        }
                        if (!bcrypt.compareSync(password, rows[0].password))
                            return done(null, false, req.flash('loginMessage', 'Wrong Password'));

                        return done(null, rows[0]);
                    });
            })
    );
};