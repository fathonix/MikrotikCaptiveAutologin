# Mikrotik Captive Autologin

This Node.js script automates logging into [Mikrotik](https://mikrotik.com) captive portal.

To add more security, Mikrotik captive portal appends some random bytes and encodes the transmitted password to MD5.
This script retrieves the bytes, appends and encodes the password, then sends it to the captive portal.

## Configuration

Create `config.json` inside the script folder, like this:

```json
[
    {
        "ssid": "<wifi name>",
        "hostname": "<captive portal hostname without http://>",
        "username": "<your username>",
        "password": "<your password>"
    }
]
```

You can add multiple configurations for different SSIDs.

`cd` to the folder and run this script.

    npm run start

No need to `npm install` since there is no dependency needed.

## Contributors

Thank you so much to [Iyxan23](https://github.com/Iyxan23) for the idea and helping me out in a lot of things,
since my JavaScript and Node.js knowledge is a bit rusty (pun intended).

## License

This script is licensed under the MIT License, © 2022 Aldo Adirajasa Fathoni.

`md5.js` is licensed under the BSD License, © 1999-2002 Paul Johnston.

`wifi-name` is licensed under the MIT License, © 2015-2017 Kevin Mårtensson.