// @flow

import BrowserS3FileSystem from './BrowserS3FileSystem';
import { findGDJS } from './BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
const gd = global.gd;

const awsS3 = require('aws-sdk/clients/s3');
const destinationBucket = `gd-games-preview`;
const accessKeyId = 'AKIAIUKQZTOSCLA5NS3Q';
const secretAccessKey = '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';
const region = 'eu-west-1';
const destinationBucketBaseUrl = `https://s3-${region}.amazonaws.com/${destinationBucket}/`;

const awsS3Client = new awsS3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

export default class BrowserS3PreviewLauncher {
  static _openPreviewWindow = (project, url): void => {
    const windowObjectReference = window.open(url, `_blank`,
    "menubar=no,status=no");
    console.log(windowObjectReference);
  };

  static _prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(({ gdjsRoot, filesContent }) => {
        if (!gdjsRoot) {
          //TODO
          console.error('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const prefix = '' + Date.now() + '-' + Math.floor(Math.random()*1000000);

        const outputDir = destinationBucketBaseUrl + prefix;
        const browserS3FileSystem = new BrowserS3FileSystem({
          filesContent,
          awsS3Client,
          bucket: destinationBucket,
          bucketBaseUrl: destinationBucketBaseUrl,
          prefix,
        });
        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          browserS3FileSystem
        );
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);
        exporter.setCodeOutputDirectory(destinationBucketBaseUrl + prefix);

        resolve({
          exporter,
          outputDir,
          browserS3FileSystem,
        });
      });
    });
  };

  static launchLayoutPreview = (project, layout): Promise<any> => {
    if (!project || !layout) return Promise.reject();

    return BrowserS3PreviewLauncher._prepareExporter().then(({
      exporter,
      outputDir,
      browserS3FileSystem,
    }) => {
      exporter.exportLayoutForPixiPreview(project, layout, outputDir);
      exporter.delete();
      return browserS3FileSystem.uploadPendingObjects().then(() => {
        const finalUrl = outputDir + '/index.html';
        BrowserS3PreviewLauncher._openPreviewWindow(project, finalUrl);
      });
    });
  };

  static launchExternalLayoutPreview = (
    project,
    layout,
    externalLayout
  ): Promise<any> => {
    return Promise.reject('Not implemented');
  };
}
