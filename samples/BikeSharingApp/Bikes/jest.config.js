module.exports = {
    coveragePathIgnorePatterns: ['/node_modules/'],
    reporters: [
        'default',
        ['jest-junit', {outputDirectory: 'reports', outputName: 'report.xml'}],
    ],
    collectCoverage: true,
    "coverageReporters": ["text", "cobertura" ]
};