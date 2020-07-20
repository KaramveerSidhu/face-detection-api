const handleRegister = (req, res, db, bcrypt) => {
	const {email, name, password} = req.body

	if(!email || !name || !password) {
		return res.status(400).json("Incorrect Form Submission!");
	}

	looksLikeMail = (str) => {
		let lastAtPos = str.lastIndexOf('@');
    	let lastDotPos = str.lastIndexOf('.');
    	return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
	}

	if (!looksLikeMail(email)) {
		return res.status(400).json("Please Enter an Email of a valid form!");
	}

	const nameCapitalized = name.toLowerCase()
    	.split(' ')
    	.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    	.join(' ');

	const hash = bcrypt.hashSync(password);

	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email,
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return	trx('users')
		 	.returning('*')
		 	.insert({
		 		name: nameCapitalized,
		 		email: loginEmail[0],
		 		joined: new Date(),
		 	}).then(user => {
		 		res.json(user[0]);
		 	})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
 	.catch(err => res.status(400).json("Unable to Register!"))	
}

module.exports = {
	handleRegister: handleRegister
}