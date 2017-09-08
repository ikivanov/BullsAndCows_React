//Token class is used to assure system's security
//some of the server methods are private and requires from playes to authenticate themselves with a token
class Token {
	constructor(key, expiresOn) {
        this.key = key;
        this.expiresOn = expiresOn;
	}
}

exports.Token = Token;