const cv = require('opencv4nodejs');
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const fs = require('fs')
const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const uuid = require('uuid');
const imageTypes= ['jpeg','jpg','pjpeg','x-png','png'].join(",")
const Recognizers = {
    lbph: new cv.LBPHFaceRecognizer(),
    eigen: new cv.EigenFaceRecognizer(),
    fisher: new cv.FisherFaceRecognizer()
}
module.exports = {
    FaceDetectFS: (DIR, CurrentBase64, SelectedRecognizer) => {
        const files = fs.readdirSync(DIR);
        const personNames = [];
        const images = [];
        const imageLabel = [];
        let matrixArray = [];
        let trainingLabelArray = [];
        const captureImageFileName = DIR + '/temp.jpeg';
        fs.writeFileSync(captureImageFileName, CurrentBase64.replace(/^data:image\/jpeg;base64,/, ""), 'base64');
        _.each(files, (currentFile) => {
            const dirCheck = DIR + "/" + currentFile;
            if (fs.statSync(dirCheck).isDirectory()) {
                const allFiles = fs.readdirSync(dirCheck);
                const subDirectory = _.filter(allFiles,file=> _.find(imageTypes.split(","),type=> path.extname(file).toLowerCase()===`.${type}`));                
                if (subDirectory && subDirectory.length > 0) {
                    personNames.push(currentFile);
                    imageLabel.push(subDirectory);
                    const imagePath = DIR + '/' + currentFile + '/';
                    images.push(subDirectory
                        .map(file => path.resolve(imagePath, file))
                        .map(filePath => cv.imread(filePath))
                        .map(img => img.bgrToGray())
                        .map(getFaceImage)
                        .map(faceImg => faceImg.resize(80, 80)));

                }
            }
        });
        _.each(images, (matrix, index) => {
            const trainingLabel = imageLabel[index]
                .map(file => personNames.findIndex(name => file.includes(name)));
            matrixArray = [...matrixArray, ...matrix];
            trainingLabelArray = [...trainingLabelArray, ...trainingLabel];
        });
        const currentImage = getFaceImage(cv.imread(captureImageFileName).bgrToGray()).resize(80, 80);
        Recognizers[SelectedRecognizer].train(matrixArray, trainingLabelArray);
        const prediction = Recognizers[SelectedRecognizer].predict(currentImage);
        fs.unlinkSync(captureImageFileName);
        return {
            Name: personNames[prediction.label],
            ProbabilityPercentage: prediction.confidence
        };

    },
    FaceDetectFSSearch: (SearchDIR, PersonNames, CurrentBase64, SelectedRecognizer) => {
        const images = [];
        let trainingLabelArray = [];
        const captureImageFileName = SearchDIR + `/${uuid.v1()}.jpeg`;
        fs.writeFileSync(captureImageFileName, CurrentBase64.replace(/^data:image\/jpeg;base64,/, ""), 'base64');
        const PNames=PersonNames.sort();
        const searchList = [...PNames, ..._.map(PNames, name => name.toLowerCase())].join(",");
        const imageTrainingSet = glob.sync(`${SearchDIR}/*{${searchList}}*.{${imageTypes}}`);
        for (i = 0; i < PNames.length; i++) {
            const trainingLabel = _.filter(imageTrainingSet,item=>item.toLowerCase().includes(PNames[i].toLowerCase()))
            trainingLabelArray = [...trainingLabelArray,...Array(trainingLabel.length).fill(i)]
            // const trainingLabel = _.filter(imageTrainingSet,item=>item.match(`/${PersonNames[i]}/ig`))
        }

        images.push(imageTrainingSet.map(filePath => cv.imread(filePath))
            .map(img => img.bgrToGray())
            .map(getFaceImage)
            .map(faceImg => faceImg.resize(80, 80)));
        
        const currentImage = getFaceImage(cv.imread(captureImageFileName).bgrToGray()).resize(80, 80);
        Recognizers[SelectedRecognizer].train(images[0], trainingLabelArray);
        const prediction = Recognizers[SelectedRecognizer].predict(currentImage);
        fs.unlinkSync(captureImageFileName);
        return {
            Name: PNames[prediction.label],
            ProbabilityPercentage: prediction.confidence
        };
    }
}

const getFaceImage = (grayImg) => {
    const faceRects = classifier.detectMultiScale(grayImg).objects;
    if (!faceRects.length) {
        throw new Error('failed to detect faces');
    }
    return grayImg.getRegion(faceRects[0]);
};