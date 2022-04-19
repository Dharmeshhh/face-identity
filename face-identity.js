const cv = require('opencv4nodejs');
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const fs = require('fs')
const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const Recognizers = {
    lbph: new cv.LBPHFaceRecognizer(),
    eigen :new cv.EigenFaceRecognizer(),
    fisher : new cv.FisherFaceRecognizer()
}
module.exports = {
    FaceDetectLabeledSetSync: () => {

    },
    FaceDetectFSSync: (DIR, CurrentBase64, SelectedRecognizer) => {
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
                const subDirectory = fs.readdirSync(dirCheck);
                if (subDirectory && subDirectory.length > 0) {
                    personNames.push(currentFile);
                    imageLabel.push(subDirectory);
                    const imagePath =DIR + '/' + currentFile + '/';
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
        return {
            Name:personNames[prediction.label],
            ProbabilityPercentage:prediction.confidence
        };
        

    },
    FaceDetectFsSearchSync: () => {

    },
    FaceDetectLabeledSet: async () => {

    },
    FaceDetectFS: async () => {

    },
    FaceDetectFsSearch: async () => {

    }
}



const getFaceImage = (grayImg) => {
    const faceRects = classifier.detectMultiScale(grayImg).objects;
    if (!faceRects.length) {
        throw new Error('failed to detect faces');
    }
    return grayImg.getRegion(faceRects[0]);
};