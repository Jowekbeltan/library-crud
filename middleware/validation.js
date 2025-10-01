function validateBook(req, res, next) {
    const { title, author, isbn } = req.body;
    const errors = [];

    if (!title || title.trim().length < 1) {
        errors.push('Title is required and must not be empty');
    }
    if (title && title.trim().length > 255) {
        errors.push('Title must be less than 255 characters');
    }
    if (!author || author.trim().length < 1) {
        errors.push('Author is required and must not be empty');
    }
    if (author && author.trim().length > 255) {
        errors.push('Author name must be less than 255 characters');
    }
    if (isbn && !/^\d{10}(\d{3})?$/.test(isbn)) {
        errors.push('ISBN must be 10 or 13 digits (numbers only)');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
}

function validateUser(req, res, next) {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Valid email is required');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
}

function validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Valid email is required');
    }
    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
}

module.exports = { validateBook, validateUser, validateLogin };