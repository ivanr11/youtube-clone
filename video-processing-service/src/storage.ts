// GCS & Local file interactions
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = 'ir11-yt-raw-videos';
const processedVideoBucketName = 'ir11-yt-processed-videos';

const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos';

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}
/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions('-vf', 'scale=-1:360') // convert video to 360p
        .on('end', () => {
            console.log('Processing finished successfully.');
            resolve();
        })
        .on('error', (err) => {
            console.log(`An error occured: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/**
 * @param filename - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(filename: string) {
    await storage.bucket(rawVideoBucketName)
    .file(filename)
    .download({ destination: `${localRawVideoPath}/${filename}`});

    console.log(
        `gs://${rawVideoBucketName}/${filename} downloaded to ${localRawVideoPath}/${filename}.`
    );
}

/**
 * @param filename - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(filename: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${filename}`, {
        destination: filename
    });
    console.log(`${localProcessedVideoPath}/${filename} uploaded to gs://${processedVideoBucketName}/${filename}.`);

    await bucket.file(filename).makePublic();
}

/**
 * @param filename - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(filename: string) {
    return deleteFile(`${localRawVideoPath}/${filename}`);
}

/**
 * @param filename - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(filename: string) {
    return deleteFile(`${localProcessedVideoPath}/${filename}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
    })
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created at ${dirPath}`);
    }
}

