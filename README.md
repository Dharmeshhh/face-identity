

![face-identity](https://raw.githubusercontent.com/Dharmeshhh/face-identity/master/FaceIdentity.png)

* **[INTRODUCTION](#introduction)**
* **[INSTALLATION](#installation)**
* **[METHODS and Examples](#methods)**

<a name="introduction"></a>

# INTRODUCTION

This package is to identify person faces by giving training images and test images. It is simple library.
This library require installation of opencv in your system.<a href="https://www.npmjs.com/package/opencv4nodejs"><b>opencv4nodejs</b></a>


<a name="installation"></a>    

# INSTALLATION

To install opencv4nodejs you need following dependency/installation to compile c++ library. FOR MORE DETAILS VISIT <a href="https://www.npmjs.com/package/opencv4nodejs"><b>opencv4nodejs</b></a>

Install this package by npm i face-identity --save

1.cmake
2.git
3.windows build tools

In last step perform npm rebuild

<a name="methods"></a>

# METHODS/EXAMPLES

Recognizer values (last parameter of function) *pass in lowercase*
1.lbph
2.eigen
3.fisher


1.FaceDetectFS(DIR, MatchImageBase64, SelectedRecognizer)

Explanation: 
This method takes 3 parameters 
<b>DIR:</b> You need to specify directory containing training image folders.
<b>MatchImageBase64:</b> Pass base64 data of a test image.
<b>SelectedRecognizer:</b> Recognizer values (lbph,eigen and fisher)


*For this function you need to store images of persons in separate folders *

i.e. Consider you have 5 persons faces Eve,Adam,James,Mike and Tyson and you have base64 image data of Adam

so your file/directory structure should be 

Root directory E:\CODE\Face-Identity\

Training Data
<b>E:\CODE\Face-Identity\Eve\ <All image files of Eve>
E:\CODE\Face-Identity\Adan\ <All image files of Adam>
E:\CODE\Face-Identity\James\ <All image files of James>
E:\CODE\Face-Identity\Mike\ <All image files of Mike>
E:\CODE\Face-Identity\Tyson\ <All image files of Tyson></b>

So it will take image data from all directories and return prediction <Directory Name and probability> 

const faceid = require('face-identity');
const fs = require('fs')
const path = require('path');

const base=fs.readFile(path.join(__dirname,"/base64.txt"),'utf8',(err,data)=> //Reading textfile containing base64 of an image
{
    const predictionFs =faceIdentity.FaceDetectFS(path.join(__dirname,"/Face-Identity"),data,"lbph");
    console.log(predictionFs);
});



2.FaceDetectFSSearch(SearchDIR, PersonNames, MatchImageBase64, SelectedRecognizer)

Explanation: 
This method takes 4 parameters 
<b>SearchDIR:</b> You need to specify directory containing training image folders.
<b>PersonNames:</b> Specify Person names (Pass Array).
<b>MatchImageBase64:</b> Pass base64 data of a test image.
<b>SelectedRecognizer:</b> Recognizer values (lbph,eigen and fisher)

Prerequisite : ALL THE IMAGES MUST HAVE PERSON NAME AS A FILE NAME
This method search images based on Person Name in given directory and train the model.  

Example 

Root directory E:\CODE\Face-Identity\<All the images of persons(Eve,Adam,James,Mike and Tyson)>



const faceid = require('face-identity');
const fs = require('fs')
const path = require('path');
const base=fs.readFile(path.join(__dirname,"/base64.txt"),'utf8',(err,data)=>
{
    const predictionFsSearch =faceIdentity.FaceDetectFSSearch(path.join(__dirname,"/face-recognition"),['Eve','Adam','James','Mike' ,'Tyson'],data,"lbph");
    console.log(predictionFsSearch);

});
    
     


