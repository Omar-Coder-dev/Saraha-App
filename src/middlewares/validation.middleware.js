export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = { ...req.body, ...req.params, ...req.query , ...req.files , ...req.file };
        const { error } = schema.validate(inputData, { abortEarly: false });
        if (error) return next(new Error(error.details.map(d => d.message), { cause: { status: 400 } }));
        next();
    };
};