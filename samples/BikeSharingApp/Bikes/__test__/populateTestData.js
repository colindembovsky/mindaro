const bikes = [
    {
        id: "632c903cfb78a31155553d92",
        available: true,
        model: "Model1",
        hourlyCost: 10,
        imageUrl: "http://image",
        address: "Some place",
        type: "mountain",
        suitableHeightInMeters: 2,
        maximumWeightInKg: 200
    },
    {
        id: "692034978834931155553d92",
        available: true,
        model: "Model2",
        hourlyCost: 20,
        imageUrl: "http://image",
        address: "Some place",
        type: "road",
        suitableHeightInMeters: 2,
        maximumWeightInKg: 200
    },
    {
        id: "0892374932874902374089",
        available: false,
        model: "Model3",
        hourlyCost: 30,
        imageUrl: "http://image",
        address: "Some place",
        type: "tandem",
        suitableHeightInMeters: 2,
        maximumWeightInKg: 400
    }
];

module.exports = {
    populateTestData: function(db, callback) {
        db.insertMany(bikes, function(err, result) {
            callback(err, result);
        });
    }
}