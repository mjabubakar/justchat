class ErrorHandler {
    authenticationError() {
        const error = new Error("Not authenticated");
        error.code = 401;
        throw error;
    }

    isNotEqual() {
        const error = new Error("Incorrect password");
        error.code = 422;
        throw error;
    }

    notConfirmed() {
        const error = new Error("An error occured");
        error.code = 400;
        throw error;
    }

    notFound(name) {
        const error = new Error(`${name} not found`);
        error.code = 404;
        throw error;
    }

    notAuthorized() {
        const error = new Error("Not authorized");
        error.code = 403;
        throw error;
    }

    isInCorrect() {
        const error = new Error("Incorrect email or password.");
        error.code = 422;
        throw error;
    }
}

const errorHandler = new ErrorHandler();
module.exports = errorHandler;