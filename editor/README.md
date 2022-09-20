# Tagging Editor

The tagging-editor is available at: https://aufgabenpool.th-koeln.de/edit/

-   Requirement: `Moodle` version `4` (3 is NOT supported).

-   It is implemented client and server side (via NodeJS) in JavaScript.

-   The editor reads and writes into the Moodle SQL database.

-   We assume `MariaDB` as database.

## Usage

-   Install dependencies:

    ```bash
    sudo apt install node apache2
    cd editor
    npm install
    ```

-   Set up the Apache web server:

    Add the following lines inside `<VirtualHost>...</VirtualHost>` in your Apache 2 configuration: `/etc/apache2/sites-available/XXX.conf` (replace `XXX`).

    ```
    ProxyRequests on
    ProxyPreserveHost on
    <Location /edit>
        ProxyPass http://localhost:3000
        ProxyPassReverse http://localhost:3000
    </Location>
    ```

    Restart Apache (replace `XXX`)

    ```bash
    sudo a2ensite XXX
    sudo service apache2 restart
    ```

-   Start the tagging editor:

    ```bash
    cd editor
    nohup ./index.sh &
    ```

-   Get process id of `index.sh`:

    ```bash
    ps -e | grep index.sh
    ```

-   Get process id of `index.js`:

    ```bash
    netstat -ltnp | grep -w ':3000'
    ```

-   Stop editor processes (replace `PID_*` by process id numbers):
    ```bash
    kill -9 PID_OF_INDEX_SH
    kill -9 PID_OF_INDEX_JS
    ```
