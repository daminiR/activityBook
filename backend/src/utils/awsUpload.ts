import { sanitizeFile } from '../utils/fileNaming'
import * as path from 'path';
import _ from 'lodash'
import { dest_gcs_images } from '../constants/'
import {Data, DisplayData } from '../types/Squash'
import AWS from 'aws-sdk'
import stream from 'stream'

const s3 = new AWS.S3({region: 'us-east-1'});
const uploadStream = ({ Bucket, Key, encoding, mimetype}) => {
  //const s3 = new AWS.S3({region: 'us-east-1'});
  console.log("contentyoe:",  mimetype)
  console.log("contentyoe:", encoding)
  const pass = new stream.PassThrough();
  return {
    writeStream: pass,
    promise: s3
      .upload(
        {
          Bucket: Bucket,
          Key: Key,
          Body: pass,
          ContentType: mimetype,
          ContentEncoding: encoding,
          //ContentEncoding: 'base64',
        }
      )
      .promise()
  };
}

// TODO: error shows before uplaod complete but uplaod works some async problem
const createAWSUpload = (image_set, _id) => {
      const promise = Promise.all(
        image_set.map(async (image) => {
          return new Promise(async (resolve, reject) => {
            const {
              filename,
              mimetype,
              encoding,
              createReadStream,
            } = await image.file;
            const sanitizedFilename = sanitizeFile(filename, _id);
            const fileLocation = path.join(
              dest_gcs_images,
              _id,
              sanitizedFilename.concat('.jpeg')
            );
            console.log("fileLoaction:", fileLocation);
            let data: Data;
            let displayData: DisplayData = {
              imageURL: "",
              filePath: "",
            };
            const { writeStream, promise } = uploadStream({
              Bucket: "sport-aws-images",
              Key: fileLocation,
              encoding: encoding,
              mimetype: mimetype,
            });
            const pipeline = createReadStream().pipe(writeStream);
            promise
              .then((awsMetaData) => {
                data = {
                  img_idx: image.img_idx,
                  imageURL: awsMetaData.Location,
                  filePath: `${fileLocation}`,
                };
                displayData = {
                  imageURL: awsMetaData.Location,
                  filePath: `${fileLocation}`,
                };
                console.log("upload completed successfully");
                resolve(data);
                console.log("done");
                console.log("upload completed successfully");
              })
              .catch((err) => {
                console.log("upload failed.", err.message);
                reject()
              });
            createReadStream().unpipe();
          });
        })
      )
      return promise
}
const deleteAllUserImages = async (image_set) => {
  // remove from gc AND mongdb
  await new Promise<void>((resolve, reject) => {
    try {
      image_set.map(async (imageObj) => {
        console.log("imageObj", imageObj.filePath)
        //await deleteFromGC(imageObj.filePath);
      });
      resolve();
    } catch {
      reject();
    }
  });
};

const deleteAWSObjects = async({ Bucket, keys }) => {
  const obj = keys.map(key => {return {Key: key.filePath}});
  //const obj2 = [
    //{

      //Key: "all_images/PjLHYn4RGldeDEP4o5NSDFwgRaJ3/20220422102348-e71f342850f202981b3f-PjLHYn4RGldeDEP4o5NSDFwgRaJ3-PjLHYn4RGldeDEP4o5NSDFwgRaJ3",
      ////VersionId: "2LWg7lQLnY41.maGB5Z6SWW.dcq0vx7b",
    //},
  //];
  console.log(obj)
  const options = {
    Bucket: Bucket,
    Delete: {
        Objects: obj,
    }
  }
  try {
    await s3.deleteObjects(options,function(err,data){
        if (err)    console.log(err,err.stack);
        else        console.log("Response:",data);
    }).promise();
} catch (e) {}
  //return await s3.deleteObjects(options).promise()

}
const deleteFilesFromAWS = async (files_to_del, original_uploaded_image_set, add_local_images_length) => {
  // remove from gc AND mongdb
  // remove from mongoDb
  // ote sure about wehen one image is left check again
  console.log("where does it go");
  if (original_uploaded_image_set.length - files_to_del.length + add_local_images_length >= 1) {
    const img_idx_del = files_to_del.map((imgObj) => imgObj.img_idx);
    const filtered_array = original_uploaded_image_set.filter(
      (imgObj) => !img_idx_del.includes(imgObj.img_idx)
    );
    console.log("check filtered again", filtered_array);
    await deleteAWSObjects({
      Bucket: "sport-aws-images",
      keys: files_to_del,
    })

    //.then((response) => {
      //console.log("done deleting", response)
    //}).catch((err) => {
    //console.log(err)})
    ////files_to_del.map(async (file_to_del) => {
      ////await deleteFromGC(file_to_del.filePath);
    ////});
    return filtered_array;
  }
  else{
    return original_uploaded_image_set

  }
};
 export {deleteAllUserImages, deleteFilesFromAWS, createAWSUpload}
//import { sanitizeFile } from '../utils/fileNaming'
//
//import { acsport1 } from '../indexDeploy'
//import * as path from 'path';
//import _ from 'lodash'
//import { dest_gcs_images } from '../constants/'
//import {Data, DisplayData } from '../types/Squash'
//import AWS from 'aws-sdk'
//import stream from 'stream'

//const s3 = new AWS.S3({region: 'us-east-1'});
//const uploadStream =  ({ Bucket, Key, encoding, mimetype}) => {
  //const pass = new stream.PassThrough();
  //return {
    //writeStream: pass,
    //promise:  s3
      //.upload(
        //{ Bucket: Bucket, Key: Key, Body: pass, ContentType: mimetype, ContentEncoding: encoding},
      //)
      //.promise()
      //.then((data) => console.log(data))
      //.catch((error) => console.error(error)),
  //};
//}

//const createAWSUpload = (image_set, _id) => {
      //const promise = Promise.all(
        //image_set.map(async (image) => {
          //return new Promise(async (resolve, reject) => {
            //const {
              //filename,
              //mimetype,
              //encoding,
              //createReadStream,
            //} = await image.file;
            //const sanitizedFilename = sanitizeFile(filename, _id);
            //const fileLocation =  path.join(dest_gcs_images, _id, sanitizedFilename)
            //console.log("fileLoaction:",fileLocation)
            //let data: Data;
            //let displayData: DisplayData = {
              //imageURL: "",
              //filePath: "",
            //};
            //const { writeStream, promise } = uploadStream({Bucket: 'sport-aws-images', Key: fileLocation, encoding: encoding, mimetype: mimetype});
            //createReadStream().pipe(
              //writeStream
                //.on("end", () => {
                       //data = {
                    //img_idx: image.img_idx,
                    //imageURL: `https://storage.googleapis.com/acsport1/${fileLocation}`,
                    //filePath: `${fileLocation}`,
                  //};
                  //displayData = {
                    //imageURL: `https://storage.googleapis.com/acsport1/${fileLocation}`,
                    //filePath: `${fileLocation}`,
                  //};
                  //console.log("done");
                  //resolve(data);
                  ////resolve(data);
                  //console.log("done");
                //})
                //.on("finish", () => {
                       //data = {
                    //img_idx: image.img_idx,
                    //imageURL: `https://storage.googleapis.com/acsport1/${fileLocation}`,
                    //filePath: `${fileLocation}`,
                  //};
                  //displayData = {
                    //imageURL: `https://storage.googleapis.com/acsport1/${fileLocation}`,
                    //filePath: `${fileLocation}`,
                  //};
                  //console.log("done");
                  //resolve(data);
                //})
                //.on("error", (error) => {
                  //console.log(error);
                  //reject()
                //})
            //);
            //createReadStream().unpipe()
            ////promise
              ////.then((awsMetaData) => {
                  ////data = {
                    ////img_idx: image.img_idx,
                    ////imageURL: awsMetaData.Location,
                    ////filePath: `${fileLocation}`,
                  ////};
                  ////displayData = {
                    ////imageURL: awsMetaData.Location,
                    ////filePath: `${fileLocation}`,
                  ////};
                  ////console.log("done");
                  ////resolve(data);
              ////})
              ////.catch((err) => {
                ////console.log("upload failed.", err.message);
              ////});
          //});
        //})
      //)
      //return promise
//}
//// TODO: fucntion untested
//const deleteAllUserImages = async (image_set) => {
  //// remove from gc AND mongdb
  //await new Promise<void>(async (resolve, reject) => {
    //try {
      //await deleteAWSObjects({ Bucket: "sport-aws-images", keys: image_set });
      //resolve();
    //} catch {
      //reject();
    //}
  //});
//};

//const deleteAWSObjects = ({ Bucket, keys }) => {
  //const obj = keys.map(key => {return {Key: key.filePath}});
  //console.log(obj)
  //const options = {
    //Bucket: Bucket,
    //Delete: {
        //Objects: obj,
    //}
  //}
  //return {
    //promise: s3.deleteObjects(options).promise()
  //};
//}
//const deleteFilesFromAWS = async (files_to_del, original_uploaded_image_set, add_local_images_length) => {
  //// remove from gc AND mongdb
  //// remove from mongoDb
  //// ote sure about wehen one image is left check again
  //if (original_uploaded_image_set.length - files_to_del.length + add_local_images_length >= 1) {
    //const img_idx_del = files_to_del.map((imgObj) => imgObj.img_idx);
    //const filtered_array = original_uploaded_image_set.filter(
      //(imgObj) => !img_idx_del.includes(imgObj.img_idx)
    //);
    //await deleteAWSObjects({Bucket: 'sport-aws-images', keys: files_to_del})

    //return filtered_array;
  //}
  //else{
    //return original_uploaded_image_set

  //}
//};
 //export {deleteAllUserImages, deleteFilesFromAWS, createAWSUpload}