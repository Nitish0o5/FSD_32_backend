import { body, param, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateTrainingCreation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('startTime')
        .notEmpty()
        .withMessage('Start time is required')
        .bail()
        .isISO8601()
        .withMessage('Start time must be a valid ISO date'),
    body('seatLimit')
        .notEmpty()
        .withMessage('Seat limit is required')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Seat limit must be a positive number')
        .toInt(),
    handleValidationErrors
];

export const validateEnrollmentCreation = [
    param('trainingId').isMongoId().withMessage('Invalid trainingId format'),
    handleValidationErrors
];
