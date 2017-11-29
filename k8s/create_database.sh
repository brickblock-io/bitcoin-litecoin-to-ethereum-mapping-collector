# On the gitlab runner we are running an SQL proxy. run 'systemctl status sql-proxy' on the runner for details.
# This proxy creates a bunch of Unix sockets at /cloudsql/ allowing us to connect to any database.
# This means that the CI can test the existance of all databases.
# I think that the CI being able to test that the created SQL user is a valuable part of deployment
# We should think very carefully about the security implications of this.

cat << _EOF_ | mysql -u$SQL_USER -p$SQL_PASSWORD -S /cloudsql/$MYSQL_INSTANCE
CREATE DATABASE IF NOT EXISTS $1; 
_EOF_
